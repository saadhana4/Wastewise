import asyncio
import sys
import subprocess

def get_windows_host():
    try:
        out = subprocess.check_output("ip route show default", shell=True).decode()
        parts = out.split()
        if len(parts) >= 3 and parts[1] == "via":
            return parts[2]
    except Exception:
        pass
    return "172.28.80.1"

WINDOWS_HOST = get_windows_host()
print(f"[TunnelClient] Target Windows Host: {WINDOWS_HOST}", flush=True)
CONTROL_PORT = 5433
PG_HOST = "127.0.0.1"
PG_PORT = 5432

async def pipe(reader, writer):
    try:
        while True:
            data = await reader.read(65536)
            if not data:
                break
            writer.write(data)
            await writer.drain()
    except Exception:
        pass
    finally:
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass

async def handle_open(conn_id):
    try:
        pg_reader, pg_writer = await asyncio.open_connection(PG_HOST, PG_PORT)
        win_reader, win_writer = await asyncio.open_connection(WINDOWS_HOST, CONTROL_PORT)
        win_writer.write(f"DATA:{conn_id}\n".encode())
        await win_writer.drain()
        await asyncio.gather(
            pipe(pg_reader, win_writer),
            pipe(win_reader, pg_writer)
        )
    except Exception as e:
        print(f"Error handling connection {conn_id}: {e}", file=sys.stderr)

async def main():
    while True:
        try:
            reader, writer = await asyncio.open_connection(WINDOWS_HOST, CONTROL_PORT)
            writer.write(b"CONTROL\n")
            await writer.drain()
            print("Connected to Windows control server.")
            while True:
                line = await reader.readline()
                if not line:
                    break
                msg = line.decode().strip()
                if msg.startswith("OPEN:"):
                    conn_id = int(msg.split(":")[1])
                    asyncio.create_task(handle_open(conn_id))
        except Exception as e:
            print(f"Control connection error: {e}. Reconnecting in 2s...")
            await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(main())
