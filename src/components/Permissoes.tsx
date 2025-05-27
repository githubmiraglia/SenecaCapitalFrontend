import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { navigationMap } from "../variables/navigationMap";
import { Checkbox, Button, FormControlLabel, Box } from "@mui/material";
import { UserPermissions } from "../types/Types";
import "../css/Permissoes.css";

interface PermissoesProps {
  chosenPermissions: UserPermissions;
  setChosenPermissions: (p: UserPermissions) => void;
}

const renderLabel = (value: unknown): React.ReactNode => {
  if (typeof value === "object" && value !== null && "label" in value) {
    return (value as { label: string }).label;
  }
  return String(value);
};

const Permissoes: React.FC<PermissoesProps> = ({
  chosenPermissions,
  setChosenPermissions,
}) => {
  const navigate = useNavigate();

  // local state to drive UI
  const [permissions, setPermissions] = useState<UserPermissions>(
    () => JSON.parse(JSON.stringify(chosenPermissions))
  );

  // sync whenever prop changes
  useEffect(() => {
    setPermissions(JSON.parse(JSON.stringify(chosenPermissions)));
  }, [chosenPermissions]);

  const toggle = (path: string[], field: "acesso" | "edicao") => {
    const updated = JSON.parse(
      JSON.stringify(permissions)
    ) as UserPermissions;
    let node: any = updated;
    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (i === path.length - 1) {
        node[key][field] = !node[key][field];
      } else {
        node = node[key].children ?? node[key];
      }
    }
    setPermissions(updated);
    setChosenPermissions(updated);
  };

   return (
    <div className="permissoes-container">
      <h2>Permissões</h2>
      <div className="permissoes-tree">
        {Object.entries(navigationMap).map(([sectionKey, section]) => {
          const top = permissions[sectionKey];
          return (
            <div key={sectionKey} className="permissoes-group">
              <div className="permissoes-inline-row">
                <span className="permissoes-label">{section.label}</span>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={top.acesso}
                      onChange={() => toggle([sectionKey], "acesso")}
                    />
                  }
                  label="Acesso"
                />
                {"children" in section && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={top.edicao}
                        onChange={() => toggle([sectionKey], "edicao")}
                      />
                    }
                    label="Edição"
                  />
                )}
              </div>

              {section.children && (
                <div className="permissoes-children">
                  {Object.entries(section.children).map(
                    ([subKey, subValue]) => {
                      const subNode =
                        permissions[sectionKey].children![subKey];
                      const hasChildren =
                        typeof subValue === "object" &&
                        "children" in subValue;

                      return (
                        <div
                          key={subKey}
                          className={
                            hasChildren
                              ? "permissoes-subgroup"
                              : "permissoes-subitem"
                          }
                        >
                          <div className="permissoes-inline-row">
                            <span className="label-text">
                              {typeof subValue === "string"
                                ? subValue
                                : subValue.label}
                            </span>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  checked={subNode.acesso}
                                  onChange={() =>
                                    toggle([sectionKey, subKey], "acesso")
                                  }
                                />
                              }
                              label="Acesso"
                            />
                            {!hasChildren && (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={subNode.edicao}
                                    onChange={() =>
                                      toggle([sectionKey, subKey], "edicao")
                                    }
                                  />
                                }
                                label="Edição"
                              />
                            )}
                          </div>

                          {hasChildren && (
                            <div className="permissoes-grandchildren">
                              {Object.entries(
                                (subValue as any).children
                              ).map(([leafKey, leafLabel]) => {
                                const leafNode =
                                  permissions[sectionKey]
                                    .children![subKey]
                                    .children![leafKey];
                                return (
                                  <div
                                    key={leafKey}
                                    className="permissoes-subitem"
                                  >
                                    <span className="label-text">
                                      {renderLabel(leafLabel)}
                                    </span>
                                    <div className="permissoes-actions">
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            size="small"
                                            checked={leafNode.acesso}
                                            onChange={() =>
                                              toggle(
                                                [
                                                  sectionKey,
                                                  subKey,
                                                  leafKey,
                                                ],
                                                "acesso"
                                              )
                                            }
                                          />
                                        }
                                        label="Acesso"
                                      />
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            size="small"
                                            checked={leafNode.edicao}
                                            onChange={() =>
                                              toggle(
                                                [
                                                  sectionKey,
                                                  subKey,
                                                  leafKey,
                                                ],
                                                "edicao"
                                              )
                                            }
                                          />
                                        }
                                        label="Edição"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Permissoes;