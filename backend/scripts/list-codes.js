import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const codesFile = join(__dirname, "../data/payment-codes.json");

const codesData = JSON.parse(readFileSync(codesFile, "utf-8"));
const unused = codesData.codes.filter(c => !c.isUsed);
const used = codesData.codes.filter(c => c.isUsed);

console.log(`\n总计: ${codesData.codes.length} 个兑换码`);
console.log(`未使用: ${unused.length} 个`);
console.log(`已使用: ${used.length} 个\n`);

if (unused.length > 0) {
  console.log('未使用的兑换码:');
  unused.forEach(c => console.log(`  ${c.code}`));
}
