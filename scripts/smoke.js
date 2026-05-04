import process from "node:process";

const frontendBaseUrl =
  process.env.SMOKE_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";
const backendBaseUrl =
  process.env.SMOKE_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

const withTrailingSlash = (value) =>
  value.endsWith("/") ? value : `${value}/`;

const checks = [
  { baseUrl: frontendBaseUrl, path: "/", expected: [200], label: "Home page" },
  { baseUrl: frontendBaseUrl, path: "/shop", expected: [200], label: "Shop page" },
  {
    baseUrl: frontendBaseUrl,
    path: "/auth/login",
    expected: [200],
    label: "Login page",
  },
  {
    baseUrl: backendBaseUrl,
    path: "health",
    expected: [200, 503],
    label: "Backend health API",
  },
];

const results = [];

for (const check of checks) {
  const url = new URL(check.path, withTrailingSlash(check.baseUrl));
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "GameArena smoke test",
      },
    });

    const duration = Date.now() - startedAt;
    const ok = check.expected.includes(response.status);
    results.push({
      ...check,
      url: url.toString(),
      status: response.status,
      duration,
      ok,
    });
  } catch (error) {
    results.push({
      ...check,
      url: url.toString(),
      status: "NETWORK_ERROR",
      duration: Date.now() - startedAt,
      ok: false,
      error: error.message,
    });
  }
}

for (const result of results) {
  const marker = result.ok ? "PASS" : "FAIL";
  console.log(
    `${marker} ${result.label} ${result.status} ${result.duration}ms ${result.url}`,
  );

  if (result.error) {
    console.log(`  ${result.error}`);
  }
}

const failed = results.filter((result) => !result.ok);

if (failed.length) {
  console.error(`${failed.length} smoke check(s) failed.`);
  process.exit(1);
}

console.log("Smoke checks passed.");
