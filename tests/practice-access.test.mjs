import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const root = new URL("../", import.meta.url);

const typesSource = await readFile(
  new URL("app/shared/types.ts", root),
  "utf8",
);

const compiledTypes = ts.transpileModule(typesSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const { accounts, canAccessWorkOrder } = await import(
  `data:text/javascript;base64,${Buffer.from(
    compiledTypes,
  ).toString("base64")}`,
);

const sydneyOrder = {
  practice: "Sydney Animal Emergency",
};

const northShoreOrder = {
  practice: "North Shore Veterinary Hospital",
};

test("veterinary accounts are assigned to a practice", () => {
  assert.equal(
    accounts["vet@gap-demo.nsw"].practice,
    "Sydney Animal Emergency",
  );
});

test("veterinary users can access their practice work", () => {
  const veterinaryUser = {
    role: "Veterinary Practice",
    practice: "Sydney Animal Emergency",
  };

  assert.equal(
    canAccessWorkOrder(veterinaryUser, sydneyOrder),
    true,
  );
});

test("veterinary users cannot access another practice", () => {
  const veterinaryUser = {
    role: "Veterinary Practice",
    practice: "Sydney Animal Emergency",
  };

  assert.equal(
    canAccessWorkOrder(veterinaryUser, northShoreOrder),
    false,
  );
});

test("unmapped veterinary users are denied access", () => {
  const unmappedVeterinaryUser = {
    role: "Veterinary Practice",
  };

  assert.equal(
    canAccessWorkOrder(unmappedVeterinaryUser, sydneyOrder),
    false,
  );
});

test("GAP staff retain cross-practice access", () => {
  const manager = {
    role: "GAP Case Manager",
  };

  assert.equal(
    canAccessWorkOrder(manager, sydneyOrder),
    true,
  );

  assert.equal(
    canAccessWorkOrder(manager, northShoreOrder),
    true,
  );
});
