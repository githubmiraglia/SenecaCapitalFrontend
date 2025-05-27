// src/components/Usuarios.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Usuarios.css";
import { UserPermissions } from "../types/Types";
import {
  checkUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  CheckUsuarioResponse,
  UsuarioPayload,
} from "../api";
import { formatCPF, formatCGC, isValidEmail } from "../utils/utils";

interface UsuarioFormData {
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  company: string;
  cgc: string;
  senha: string;
}

interface FormErrors {
  nome: boolean;
  sobrenome: boolean;
  email: boolean;
}

interface UsuariosProps {
  chosenPermissions: UserPermissions;
  setChosenPermissions: (permissions: UserPermissions) => void;
  chosenFunds: Record<string, any>;
  setChosenFunds: (funds: Record<string, any>) => void;
}

const Usuarios: React.FC<UsuariosProps> = ({
  chosenPermissions,
  setChosenPermissions,
  chosenFunds,
  setChosenFunds,
}) => {
  const [formData, setFormData] = useState<UsuarioFormData>({
    nome: "",
    sobrenome: "",
    email: "",
    cpf: "",
    company: "",
    cgc: "",
    senha: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    nome: false,
    sobrenome: false,
    email: false,
  });

  const [existingId, setExistingId] = useState<number | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasChecked) return;

    const rawCpf = formData.cpf.replace(/\D/g, "");
    const hasFullCPF = rawCpf.length === 11;
    const validEmail = isValidEmail(formData.email);
    if (!validEmail && !hasFullCPF) return;

    const params = validEmail
      ? { email: formData.email.trim() }
      : { cpf: rawCpf };

    checkUsuario(params)
      .then((data: CheckUsuarioResponse) => {
        if (!data) return;
        setFormData({
          nome: data.nome,
          sobrenome: data.sobrenome,
          email: data.email,
          cpf: formatCPF(data.cpf),
          company: data.company,
          cgc: formatCGC(data.cgc),
          senha: "",
        });
        setChosenPermissions(JSON.parse(JSON.stringify(data.userPermissions)));
        setChosenFunds(data.acesso_a_fundos || {});
        setExistingId(data.id ?? null);
      })
      .finally(() => {
        setHasChecked(true);
      });
  }, [formData.email, formData.cpf, setChosenPermissions, hasChecked, setChosenFunds]);

  useEffect(() => {
    if (!hasChecked) return;
    const timer = setTimeout(() => {
      navigate("/cadastros/usuarios/usuariospage", { replace: true });
    }, 200);
    return () => clearTimeout(timer);
  }, [hasChecked, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "cpf") formatted = formatCPF(value);
    if (name === "cgc") formatted = formatCGC(value);
    setFormData((prev) => ({ ...prev, [name]: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {
      nome: !formData.nome.trim(),
      sobrenome: !formData.sobrenome.trim(),
      email: !formData.email.trim() || !isValidEmail(formData.email),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      alert("Por favor, preencha corretamente os campos obrigatórios.");
      return;
    }

    const payload: UsuarioPayload = {
      nome: formData.nome,
      sobrenome: formData.sobrenome,
      email: formData.email,
      cpf: formData.cpf.replace(/\D/g, ""),
      company: formData.company,
      cgc: formData.cgc.replace(/\D/g, ""),
      senha: formData.senha,
      userPermissions: chosenPermissions,
      acesso_a_fundos: chosenFunds,
    };

    localStorage.setItem("userChosenPermissions", JSON.stringify(chosenPermissions));
    localStorage.setItem("userChosenFunds", JSON.stringify(chosenFunds));

    try {
      if (existingId) {
        await updateUsuario(existingId, payload);
        alert("Usuário editado com sucesso!");
      } else {
        const created = await createUsuario(payload);
        setExistingId((created as any).id ?? null);
        alert("Usuário adicionado com sucesso!");
      }
      navigate("/");
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      alert("Ocorreu um erro ao salvar. Tente novamente.");
    }
  };

  const handleDelete = async () => {
    if (!existingId) return;
    if (!window.confirm("Deseja realmente excluir este usuário?")) return;

    try {
      await deleteUsuario(existingId);
      alert("Usuário excluído com sucesso!");
      navigate("/");
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      alert("Ocorreu um erro ao excluir. Tente novamente.");
    }
  };

  return (
    <div className="usuarios-form-container">
      <h2 className="usuarios-title">Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit} className="usuarios-form-horizontal">
        <label>
          Nome *
          <input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={errors.nome ? "error" : ""}
          />
        </label>

        <label>
          Sobrenome *
          <input
            name="sobrenome"
            value={formData.sobrenome}
            onChange={handleChange}
            className={errors.sobrenome ? "error" : ""}
          />
        </label>

        <label>
          Email *
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "error" : ""}
          />
        </label>

        <label>
          CPF
          <input
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            maxLength={14}
          />
        </label>

        <label>
          Empresa
          <input
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </label>

        <label>
          CGC
          <input
            name="cgc"
            value={formData.cgc}
            onChange={handleChange}
            maxLength={18}
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
          />
        </label>

        <div className="form-buttons" style={{ marginTop: "1rem", textAlign: "right" }}>
          <button type="submit" style={{ marginRight: "0.5rem" }}>
            Salvar
          </button>
          {existingId && (
            <button
              type="button"
              onClick={handleDelete}
              style={{ background: "red", color: "white" }}
            >
              Excluir
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Usuarios;
