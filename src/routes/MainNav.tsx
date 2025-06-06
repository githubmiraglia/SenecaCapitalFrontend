import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Box, Typography, Menu, MenuItem } from "@mui/material";
import "../css/mainnavigation.css";
import { navigationMap } from "../variables/navigationMap";
import { UserPermissions } from "../types/Types";

interface MainNavProps {
  userPermissions: UserPermissions;
}

// Type guard to check for nested children
const hasChildren = (node: any): node is { children: Record<string, any> } =>
  typeof node === "object" && node !== null && "children" in node;

const MainNav: React.FC<MainNavProps> = ({ userPermissions }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [openSubmenuKey, setOpenSubmenuKey] = useState<string | null>(null);

  const handleMainHover = (event: React.MouseEvent<HTMLElement>, key: string) => {
    if (userPermissions[key]?.acesso) {
      setAnchorEl(event.currentTarget);
      setOpenMenuKey(key);
      setOpenSubmenuKey(null);
      setSubmenuAnchorEl(null);
    }
  };

  const handleSubmenuClick = (event: React.MouseEvent<HTMLElement>, subKey: string) => {
    setSubmenuAnchorEl(event.currentTarget);
    setOpenSubmenuKey((prev) => (prev === subKey ? null : subKey));
  };

  const handleCloseMenus = () => {
    setAnchorEl(null);
    setSubmenuAnchorEl(null);
    setOpenMenuKey(null);
    setOpenSubmenuKey(null);
  };

  const handleNavigate = (path: string) => {
    const fullPath = `/${path}`;
    const currentPath = window.location.pathname;

    console.log(`Navigating to: ${fullPath} from current path: ${currentPath}`);

    if (currentPath === fullPath) {
      navigate("/temp", { replace: true });
      setTimeout(() => navigate(fullPath), 0);
    } else {
      navigate(fullPath);
    }

    handleCloseMenus();
  };

  return (
    <>
      <Box className="mui-nav-container">
        {Object.entries(navigationMap).map(([sectionKey, sectionValue]) => {
          const topAccess = userPermissions[sectionKey]?.acesso;
          const sectionPermissions = userPermissions[sectionKey]?.children ?? {};

          const boxClass = [
            "mui-nav-link",
            !topAccess ? "disabled" : "",
            openMenuKey === sectionKey ? "hovered" : ""
          ].join(" ").trim();

          return (
            <Box
              key={sectionKey}
              className={boxClass}
              onMouseEnter={(e) => handleMainHover(e, sectionKey)}
            >
              <Typography>{sectionValue.label}</Typography>

              {topAccess && hasChildren(sectionValue) && (
                <Menu
                  anchorEl={anchorEl}
                  open={openMenuKey === sectionKey}
                  onClose={handleCloseMenus}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  {Object.entries(sectionValue.children).map(([subKey, subValue]) => {
                    const subLabel = subValue.label;
                    const hasSubChildren = hasChildren(subValue);
                    const submenuItems = hasSubChildren
                      ? Object.entries(subValue.children)
                      : [];
                    const submenuPermission = sectionPermissions[subKey];

                    return hasSubChildren ? (
                      <MenuItem
                        key={subKey}
                        onClick={(e) => handleSubmenuClick(e, subKey)}
                        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      >
                        <span>{subLabel}</span>
                        <span style={{ marginLeft: "0.5rem" }}>▾</span>
                        <Menu
                          anchorEl={submenuAnchorEl}
                          open={openSubmenuKey === subKey}
                          onClose={handleCloseMenus}
                          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                          transformOrigin={{ vertical: "top", horizontal: "left" }}
                          slotProps={{ paper: { className: "submenu-paper" } }}
                        >
                          {submenuItems.map(([nestedKey, nestedValue]) => {
                            const nestedLabel = nestedValue.label;
                            const allowed = submenuPermission?.children?.[nestedKey]?.acesso;

                            return (
                              <MenuItem
                                key={nestedKey}
                                onClick={() =>
                                  allowed && handleNavigate(`${sectionKey}/${subKey}/${nestedKey}`)
                                }
                                className={allowed ? "" : "disabled"}
                              >
                                {nestedLabel}
                              </MenuItem>
                            );
                          })}
                        </Menu>
                      </MenuItem>
                    ) : (
                      <MenuItem
                        key={subKey}
                        onClick={() =>
                          sectionPermissions[subKey]?.acesso &&
                          handleNavigate(`${sectionKey}/${subKey}`)
                        }
                        className={sectionPermissions[subKey]?.acesso ? "" : "disabled"}
                      >
                        {subLabel}
                      </MenuItem>
                    );
                  })}
                </Menu>
              )}
            </Box>
          );
        })}
      </Box>

      <Outlet />
    </>
  );
};

export default MainNav;
