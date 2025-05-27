import React, { useEffect } from "react";
import Usuarios from "../../../components/Usuarios";
import Permissoes from "../../../components/Permissoes";
import Acesso_a_Fundos from "../../../components/Acesso_a_Fundos";
import { UserPermissions } from "../../../types/Types";
import "./UsuariosPage.css";

interface UsuariosPageProps {
  chosenPermissions: UserPermissions;
  setChosenPermissions: (permissions: UserPermissions) => void;
  chosenFunds: Record<string, any>;
  setChosenFunds: (funds: Record<string, any>) => void;
}

const UsuariosPage: React.FC<UsuariosPageProps> = ({
  chosenPermissions,
  setChosenPermissions,
  chosenFunds,
  setChosenFunds,
}) => {
  
  return (
    <div className="usuarios-page-container">
      <div className="usuarios-left-column">
        <Usuarios
          chosenPermissions={chosenPermissions}
          setChosenPermissions={setChosenPermissions}
          chosenFunds={chosenFunds}
          setChosenFunds={setChosenFunds}
        />
      </div>

      <div className="usuarios-right-column">
        <div className="usuarios-right-top">
          <Permissoes
            key={JSON.stringify(chosenPermissions)}
            chosenPermissions={chosenPermissions}
            setChosenPermissions={setChosenPermissions}
          />
        </div>
        <div className="usuarios-right-bottom">
          <Acesso_a_Fundos
            chosenFunds={chosenFunds}
            setChosenFunds={setChosenFunds}
          />
        </div>
      </div>
    </div>
  );
};

export default UsuariosPage;
