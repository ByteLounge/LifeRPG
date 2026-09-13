import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "node:util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

// Ensure automated tests always run against the isolated test store
process.env.DEMO_STORAGE_FALLBACK = "true";
delete process.env.DATABASE_URL;
