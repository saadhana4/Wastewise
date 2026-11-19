import time
import psycopg

def test_conn(host):
    print(f"\nAttempting connection to PostgreSQL at {host}:5432...")
    try:
        start = time.perf_counter()
        conn = psycopg.connect(
            f"postgresql://wastewise_user:wastewise_secure_password@{host}:5432/wastewise_db",
            connect_timeout=3
        )
        elapsed = (time.perf_counter() - start) * 1000
        print(f"-> SUCCESS: Connected to {host} in {elapsed:.2f} ms")

        with conn.cursor() as cur:
            cur.execute("SELECT PostGIS_Version()")
            print(f"-> PostGIS Version: {cur.fetchone()[0]}")

            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = [row[0] for row in cur.fetchall()]
            print(f"-> Tables in wastewise_db: {tables}")

            cur.execute("SELECT count(*) FROM waste_categories")
            print(f"-> Waste Categories count: {cur.fetchone()[0]}")

        conn.close()
        return True
    except Exception as e:
        print(f"-> FAILED for {host}: {e}")
        return False

def main():
    hosts = ["172.28.82.25", "localhost", "127.0.0.1"]
    for h in hosts:
        if test_conn(h):
            print(f"\nWorking host found: {h}")
            break

if __name__ == "__main__":
    main()
