// src/pages/Home.js
import React, { useState } from "react";
import { db } from "../services/firebase"; // ajuste se o caminho do seu firebase for diferente
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
} from "firebase/firestore";

// ===== helper: sequencial global por ano (transacional) =====
async function getNextNumeroProjeto(dbInstance) {
  const ano = new Date().getFullYear();
  const counterRef = doc(dbInstance, "counters", `global-${ano}`);

  const next = await runTransaction(dbInstance, async (tx) => {
    const snap = await tx.get(counterRef);
    if (!snap.exists()) {
      // inicia contador em 2, devolvendo 1
      tx.set(counterRef, { next: 2, updatedAt: serverTimestamp() });
      return 1;
    } else {
      const curr = snap.data().next || 1;
      tx.update(counterRef, { next: curr + 1, updatedAt: serverTimestamp() });
      return curr;
    }
  });

  return String(next);
}

export default function Home() {
  const [form, setForm] = useState({
    cliente: "",
    descricao: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // === CRIAR NOVO RELATÓRIO (sempre gera nº no servidor) ===
  const handleCreateInspection = async (e) => {
    e?.preventDefault?.();
    try {
      setLoading(true);

      const numeroProjeto = await getNextNumeroProjeto(db);

      const payload = {
        ...form,
        numeroProjeto,
        ano: new Date().getFullYear(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, "inspections"), payload);

      console.log("Relatório criado:", ref.id, "Nº", numeroProjeto);
      alert(`Relatório criado com nº ${numeroProjeto}`);
      setForm({ cliente: "", descricao: "" });
    } catch (err) {
      console.error(err);
      alert("Falha ao criar relatório");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page home">
      <h1>Novo Relatório NR-13</h1>
      <form onSubmit={handleCreateInspection}>
        <label>
          Cliente
          <input
            name="cliente"
            value={form.cliente}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Descrição
          <input
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Gerando nº..." : "Criar relatório"}
        </button>
      </form>
    </div>
  );
}
