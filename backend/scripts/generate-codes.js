import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const codesFile = join(__dirname, "../data/payment-codes.json");

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 9; i++) {
    if (i === 3 || i === 6) code += '-';
    else code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const count = parseInt(process.argv[2]) || 10;
const codesData = JSON.parse(readFileSync(codesFile, "utf-8"));

for (let i = 0; i < count; i++) {
  codesData.codes.push({
    code: generateCode(),
    isUsed: false,
    usedBy: null,
    usedAt: null,
    createdAt: new Date().toISOString()
  });
}

writeFileSync(codesFile, JSON.stringify(codesData, null, 2));
console.log(`生成了 ${count} 个兑换码`);
