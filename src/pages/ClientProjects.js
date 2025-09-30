// src/pages/ClientProjects.js
import React, { useEffect, useState } from "react";
import { db } from "../services/firebase"; // ajuste o caminho
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
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

export default function ClientProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchClientProjects = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "inspections"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setProjects(arr);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientProjects();
  }, []);

  const handleDuplicate = async () => {
    if (!selectedProject) return;
    try {
      setLoading(true);

      const {
        id,
        numeroProjeto,
        createdAt,
        updatedAt,
        ...projectData
      } = selectedProject;

      const novoNumero = await getNextNumeroProjeto(db);

      const newProjectData = {
        ...projectData,
        numeroProjeto: novoNumero,
        ano: new Date().getFullYear(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, "inspections"), newProjectData);
      console.log("Projeto duplicado:", ref.id, "Nº", novoNumero);
      alert(`Relatório duplicado com nº ${novoNumero}`);
      await fetchClientProjects();
    } catch (err) {
      console.error(err);
      alert("Falha ao duplicar relatório");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page client-projects">
      <h1>Relatórios</h1>

      {loading && <p>Carregando…</p>}

      <ul>
        {projects.map((p) => (
          <li key={p.id} onClick={() => setSelectedProject(p)}>
            <strong>#{p.numeroProjeto}</strong> — {p.cliente || p.titulo || "(sem título)"}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 16 }}>
        <button onClick={handleDuplicate} disabled={!selectedProject || loading}>
          {loading ? "Processando..." : "Duplicar selecionado"}
        </button>
      </div>
    </div>
  );
}
