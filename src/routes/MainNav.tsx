import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Box, Typography, Menu, MenuItem } from "@mui/material";
import "../css/mainnavigation.css";
import { navigationMap } from "../variables/navigationMap";
import { UserPermissions, PermissionNode } from "../types/Types";

interface MainNavProps {
  userPermissions: UserPermissions;
}

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
      // Force re-navigation by first navigating away and then back
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
        {Object.entries(navigationMap).map(([key, value]) => {
          const topAccess = userPermissions[key]?.acesso;
          const sectionPermissions = userPermissions[key]?.children ?? {};

          const boxClass = [
            "mui-nav-link",
            !topAccess ? "disabled" : "",
            openMenuKey === key ? "hovered" : ""
          ].join(" ").trim();

          return (
            <Box
              key={key}
              className={boxClass}
              onMouseEnter={(e) => handleMainHover(e, key)}
            >
              <Typography>{value.label}</Typography>

              {topAccess && (
                <Menu
                  anchorEl={anchorEl}
                  open={openMenuKey === key}
                  onClose={handleCloseMenus}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  {Object.entries(value.children).map(([subKey, subValue]) => {
                    const label = typeof subValue === "string"
                      ? subValue
                      : "label" in subValue
                        ? subValue.label
                        : subKey;

                    const hasNested = typeof subValue === "object" && subValue !== null && "children" in subValue;
                    const submenuItems = hasNested ? Object.entries(subValue.children as Record<string, string>) : [];
                    const submenuPermission = sectionPermissions[subKey];

                    return hasNested ? (
                      <MenuItem
                        key={subKey}
                        onClick={(e) => handleSubmenuClick(e, subKey)}
                        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      >
                        <span>{label}</span>
                        <span style={{ marginLeft: "0.5rem" }}>▾</span>
                        <Menu
                          anchorEl={submenuAnchorEl}
                          open={openSubmenuKey === subKey}
                          onClose={handleCloseMenus}
                          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                          transformOrigin={{ vertical: "top", horizontal: "left" }}
                          slotProps={{ paper: { className: "submenu-paper" } }}
                        >
                          {submenuItems.map(([nestedKey, nestedLabel]) => {
                            const allowed = submenuPermission?.children?.[nestedKey]?.acesso;
                            return (
                              <MenuItem
                                key={nestedKey}
                                onClick={() => allowed && handleNavigate(`${key}/${subKey}/${nestedKey}`)}
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
                          handleNavigate(`${key}/${subKey}`)
                        }
                        className={sectionPermissions[subKey]?.acesso ? "" : "disabled"}
                      >
                        {label}
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
