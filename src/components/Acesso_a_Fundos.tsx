import React, { useState, useEffect } from "react";
import "../css/Acesso_a_Fundos.css";
import { getFundosComClasses } from "../api";
import { AcessoAFundos } from "../types/Types"; // ✅ import shared types

export interface AcessoAFundosProps {
  chosenFunds: AcessoAFundos;
  setChosenFunds: (funds: AcessoAFundos) => void;
}

const Acesso_a_Fundos: React.FC<AcessoAFundosProps> = ({
  chosenFunds,
  setChosenFunds,
}) => {
  const [localAcesso, setLocalAcesso] = useState<AcessoAFundos>(
    () => JSON.parse(JSON.stringify(chosenFunds))
  );

  // ⬇️ Step 1: Load full fund/class structure if none yet
  useEffect(() => {
    if (Object.keys(chosenFunds).length === 0) {
      getFundosComClasses()
        .then((data) => {
          const cloned = JSON.parse(JSON.stringify(data));
          setChosenFunds(cloned);
          setLocalAcesso(cloned);
        })
        .catch((err) =>
          console.error("❌ Failed to fetch fundos:", err)
        );
    }
  }, [chosenFunds, setChosenFunds]);

  // ⬇️ Step 2: Sync chosenFunds into local state on update
  useEffect(() => {
    setLocalAcesso(JSON.parse(JSON.stringify(chosenFunds)));
  }, [chosenFunds]);

  const handleFundoToggle = (fundo: string) => {
    const updated = JSON.parse(JSON.stringify(localAcesso));
    updated[fundo].acesso = !updated[fundo].acesso;
    setLocalAcesso(updated);
    setChosenFunds(updated);
  };

  const handleClasseToggle = (fundo: string, classe: string) => {
    const updated = JSON.parse(JSON.stringify(localAcesso));
    updated[fundo].classe[classe].acesso =
      !updated[fundo].classe[classe].acesso;
    setLocalAcesso(updated);
    setChosenFunds(updated);
  };

  return (
    <div className="acesso-a-fundos-container">
      <h3>Acesso a Fundos</h3>
      <div className="acesso-tree">
        {Object.entries(localAcesso || {}).length === 0 ? (
          <p>Nenhum fundo carregado.</p>
        ) : (
          Object.entries(localAcesso).map(([fundo, fundoData]) => (
            <div key={fundo} className="acesso-fundo-block">
              <label className="fundo-label">
                <input
                  type="checkbox"
                  checked={!!fundoData.acesso}
                  onChange={() => handleFundoToggle(fundo)}
                />
                {fundo}
              </label>

              <div className="acesso-classes">
                {fundoData?.classe &&
                  Object.entries(fundoData.classe).map(([classe, _]) => (
                    <label key={classe} className="classe-label">
                      <input
                        type="checkbox"
                        checked={!!fundoData.classe[classe]?.acesso}
                        onChange={() =>
                          handleClasseToggle(fundo, classe)
                        }
                      />
                      {classe}
                    </label>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Acesso_a_Fundos;
