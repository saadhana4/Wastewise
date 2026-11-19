import asyncio
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [TunnelServer] %(message)s")
logger = logging.getLogger("TunnelServer")

CONTROL_PORT = 5433
PG_PORT = 5432

control_writer = None
pending_clients = {}
next_conn_id = 1

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

async def handle_control(reader, writer):
    global control_writer, next_conn_id
    line = await reader.readline()
    cmd = line.decode().strip()
    if cmd == "CONTROL":
        logger.info("WSL control channel connected.")
        control_writer = writer
        try:
            while True:
                # Keepalive
                await asyncio.sleep(10)
                control_writer.write(b"PING\n")
                await control_writer.drain()
        except Exception:
            logger.info("WSL control channel disconnected.")
            control_writer = None
    elif cmd.startswith("DATA:"):
        conn_id = int(cmd.split(":")[1])
        if conn_id in pending_clients:
            client_reader, client_writer = pending_clients.pop(conn_id)
            logger.info(f"Bridged connection #{conn_id} between Windows and WSL Docker PostGIS.")
            await asyncio.gather(
                pipe(client_reader, writer),
                pipe(reader, client_writer)
            )

async def handle_client(reader, writer):
    global next_conn_id, control_writer
    if not control_writer:
        logger.warning("Connection to port 5432 received, but WSL bridge is not connected!")
        writer.close()
        return

    conn_id = next_conn_id
    next_conn_id += 1
    pending_clients[conn_id] = (reader, writer)
    
    try:
        control_writer.write(f"OPEN:{conn_id}\n".encode())
        await control_writer.drain()
    except Exception as e:
        logger.error(f"Failed to notify WSL worker: {e}")
        pending_clients.pop(conn_id, None)
        writer.close()

async def main():
    control_server = await asyncio.start_server(handle_control, "0.0.0.0", CONTROL_PORT)
    pg_server = await asyncio.start_server(handle_client, "127.0.0.1", PG_PORT)
    logger.info(f"Port 5432 proxy listening. Control on {CONTROL_PORT}...")
    async with control_server, pg_server:
        await asyncio.gather(control_server.serve_forever(), pg_server.serve_forever())

if __name__ == "__main__":
    asyncio.run(main())
