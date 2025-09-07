export const navigationMap = {
  lista_de_cris: {
    label: "Lista de CRIs",
    children: {
      lista_de_cris: { label: "Lista de CRIs" },
    },
  },
  indices: {
    label: "Taxas de Mercado",
    children: {
      indices: { label: "Indices" },
      IndiceIpcaDiario: { label: "IPCA Diário" },
    },
  },
  precos: {
    label: "Mercado Secundário",
    children: {
      precos: { label: "Mercado Secundário" },
    },
  },
  investidores: {
    label: "Investidores",
    children: {
      investidores: { label: "Investidores" },  // ✅ new entry
    },
  },
  robo: {
    label: "Robô",
    children: {
      robo: { label: "Rodar Robô"},
    },
  },
}