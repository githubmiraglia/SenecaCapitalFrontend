// /variables/generalVariables.ts
import { UserPermissions, AcessoAFundos } from "../types/Types";

// FUNDO AND CLASSE VARIABLES
type FundoInfo = {
    fundoID: string;
    fundoName: string;
  };
  
  type ClasseInfo = {
    classeID: string;
    classeName: string;
  };
  
 export const currentVariables = {
  fundo: {
    fundoID: "",
    fundoName: "",
  } as FundoInfo,

  classe: {
    classeID: "",
    classeName: "",
  } as ClasseInfo,

  user: {
    token: "",
    email: "",
    nome: "",
    sobrenome: "",
  },

  permissions: {
    fullPermissions: {} as UserPermissions,
    chosenPermissions: {} as UserPermissions,
    chosenFunds: {} as AcessoAFundos,
  },

  session: {
    isAuthenticated: false,
  },
};
  
export function setUserContextFromLoginResponse(data: {
  access: string;
  user: {
    nome: string;
    sobrenome: string;
    email: string;
    userPermissions: UserPermissions;
    acesso_a_fundos: AcessoAFundos;
  };
}) {
  currentVariables.user.token = data.access;
  currentVariables.user.nome = data.user.nome;
  currentVariables.user.sobrenome = data.user.sobrenome;
  currentVariables.user.email = data.user.email;
  currentVariables.session.isAuthenticated = true;
  currentVariables.permissions.fullPermissions = data.user.userPermissions;
  currentVariables.permissions.chosenPermissions = JSON.parse(JSON.stringify(data.user.userPermissions));
  currentVariables.permissions.chosenFunds = data.user.acesso_a_fundos;

}

  // SETTERS
  // In setFundo in generalVariables.ts:
 export function setFundo(fundoID: string, fundoName: string) {
     currentVariables.fundo.fundoID = fundoID;
     currentVariables.fundo.fundoName = fundoName;
     window.dispatchEvent(new Event("fundoUpdated"));
 }
  
  export function setClasse(classeID: string, classeName: string) {
    currentVariables.classe.classeID = classeID;
    currentVariables.classe.classeName = classeName;
  }
  
  // GETTERS (by field)
  export function getFundoID(): string {
    return currentVariables.fundo.fundoID;
  }
  
  export function getFundoName(): string {
    return currentVariables.fundo.fundoName;
  }
  
  export function getClasseID(): string {
    return currentVariables.classe.classeID;
  }
  
  export function getClasseName(): string {
    return currentVariables.classe.classeName;
  }
  // END OF FUNDO AND CLASSE VARIABLES

// ACESSO A FUNDO VARIABLES
export const blankChosenFunds: Record<string, any> = {};