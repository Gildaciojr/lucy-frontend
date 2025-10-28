// frontend/src/lib/api.ts
// ✅ Anti-flood: cache 30s por rota, de-duplicação de requisições em andamento,
// debounce entre chamadas e retry automático para 429/503 com backoff.

type AnyJson = unknown;

const CACHE_TIME = 30_000; // 30s
const MIN_INTERVAL = 300; // debounce global leve entre requisições
const MAX_RETRIES = 2;

let lastFetchAt = 0;

const memCache: Record<string, { at: number; data: AnyJson }> =
  Object.create(null);

const inflight = new Map<string, Promise<AnyJson>>();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function cacheKey(path: string, options?: RequestInit) {
  // cache apenas para GET (idempotente)
  const method = (options?.method || "GET").toUpperCase();
  if (method !== "GET") return "";
  return path;
}

async function doFetchJson(
  path: string,
  options?: RequestInit
): Promise<AnyJson> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  // debounce global suave
  const since = Date.now() - lastFetchAt;
  if (since < MIN_INTERVAL) {
    await sleep(MIN_INTERVAL - since);
  }

  lastFetchAt = Date.now();

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  if (res.status === 204) return null;
  if (!res.ok) {
    // propaga erro com payload útil quando possível
    let msg = `Erro ${res.status}: ${res.statusText}`;
    try {
      const j = await res.json();
      if (j?.message)
        msg = Array.isArray(j.message)
          ? j.message.join(", ")
          : String(j.message);
    } catch {}
    const e = new Error(msg);
    // @ts-expect-error status é adicionado dinamicamente
    e.status = res.status;
    throw e;
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function apiFetch<T = AnyJson>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const key = cacheKey(path, options);

  // cache de 30s para GET
  if (key) {
    const c = memCache[key];
    if (c && Date.now() - c.at < CACHE_TIME) {
      return c.data as T;
    }
    // de-dupe: se já existe uma chamada GET em andamento para a mesma rota, reuse
    const running = inflight.get(key);
    if (running) {
      return (await running) as T;
    }
  }

  // retry/backoff para 429/503
  let attempt = 0;
  const runner = (async () => {
    while (true) {
      try {
        const data = await doFetchJson(path, options);
        if (key) memCache[key] = { at: Date.now(), data };
        return data as T;
      } catch (err: unknown) {
        const status =
          typeof err === "object" && err && "status" in err
            ? (err as { status?: number }).status ?? 0
            : 0;

        if ((status === 429 || status === 503) && attempt < MAX_RETRIES) {
          const backoff =
            (attempt + 1) * 1000 + Math.round(Math.random() * 500);
          await sleep(backoff);
          attempt++;
          continue;
        }
        throw err;
      } finally {
        if (key && inflight.get(key)) {
          // limpar inflight ao término (success/throw)
          inflight.delete(key);
        }
      }
    }
  })();

  if (key) inflight.set(key, runner);
  return runner;
}

// ✅ Para downloads (blob/pdf/csv/xlsx)
export async function apiFetchRaw(
  path: string,
  options?: RequestInit
): Promise<Blob> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  // debounce leve
  const since = Date.now() - lastFetchAt;
  if (since < MIN_INTERVAL) {
    await sleep(MIN_INTERVAL - since);
  }
  lastFetchAt = Date.now();

  let attempt = 0;
  while (true) {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });

    if (res.ok) return res.blob();

    if ((res.status === 429 || res.status === 503) && attempt < MAX_RETRIES) {
      const backoff = (attempt + 1) * 1000 + Math.round(Math.random() * 500);
      await sleep(backoff);
      attempt++;
      continue;
    }
    throw new Error(`Erro ${res.status}: ${res.statusText}`);
  }
}

// ✅ helper simples para invalidar cache de uma rota GET
export function apiInvalidate(path: string) {
  const key = cacheKey(path, { method: "GET" });
  if (key && memCache[key]) delete memCache[key];
}

