export type Product = {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
};

export type ProductForm = Omit<Product, "id">;

// ---- Permissions ----

export interface PermissionNode {
  acesso: boolean;
  edicao: boolean;
  children?: {
    [key: string]: PermissionNode;
  };
}

export interface UserPermissions {
  [key: string]: PermissionNode;
}

// ---- Fundo & Classe Access ----

export interface ClasseAccess {
  acesso: boolean;
}

export interface FundoAccess {
  acesso: boolean;
  classe: {
    [classeName: string]: ClasseAccess;
  };
}

export interface AcessoAFundos {
  [fundoName: string]: FundoAccess;
}

export interface TreeNode {
  id: string;
  label: string;
  fullPath: string;
  children?: TreeNode[];
}