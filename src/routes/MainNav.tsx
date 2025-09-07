import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Box, Typography, Menu, MenuItem } from "@mui/material";
import "../css/mainnavigation.css";
import { navigationMap } from "../variables/navigationMap";

const MainNav: React.FC = () => {
  const navigate = useNavigate();

  const [mainAnchorEl, setMainAnchorEl] = useState<HTMLElement | null>(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<HTMLElement | null>(null);
  const [openMainKey, setOpenMainKey] = useState<string | null>(null);
  const [openSubKey, setOpenSubKey] = useState<string | null>(null);

  const handleMainEnter = (event: React.MouseEvent<HTMLElement>, key: string) => {
    setMainAnchorEl(event.currentTarget);
    setOpenMainKey(key);
    setOpenSubKey(null);
    setSubmenuAnchorEl(null);
  };

  const handleSubEnter = (event: React.MouseEvent<HTMLElement>, key: string) => {
    setSubmenuAnchorEl(event.currentTarget);
    setOpenSubKey(key);
  };

  const closeMenus = () => {
    setMainAnchorEl(null);
    setSubmenuAnchorEl(null);
    setOpenMainKey(null);
    setOpenSubKey(null);
  };

  const goTo = (path: string) => {
    navigate(`/${path}`);
    closeMenus();
  };

  return (
    <>
      <Box className="mui-nav-container" onMouseLeave={closeMenus}>
        {Object.entries(navigationMap).map(([sectionKey, sectionValue]) => (
          <Box
            key={sectionKey}
            className="mui-nav-link"
            onMouseEnter={(e) => handleMainEnter(e, sectionKey)}
          >
            <Typography>{sectionValue.label}</Typography>

            <Menu
              anchorEl={mainAnchorEl}
              open={openMainKey === sectionKey}
              onClose={closeMenus}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              MenuListProps={{ onMouseLeave: closeMenus }}
            >
              {sectionValue.children &&
                Object.entries(sectionValue.children).map(([subKey, subValue]) => {
                  const hasSubChildren = subValue.children;

                  return hasSubChildren ? (
                    <MenuItem
                      key={subKey}
                      onMouseEnter={(e) => handleSubEnter(e, subKey)}
                      onClick={(e) => e.preventDefault()}
                    >
                      {subValue.label}
                      <Menu
                        anchorEl={submenuAnchorEl}
                        open={openSubKey === subKey}
                        onClose={closeMenus}
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "left" }}
                        MenuListProps={{ onMouseLeave: closeMenus }}
                      >
                        {Object.entries(subValue.children).map(([childKey, childValue]) => (
                          <MenuItem
                            key={childKey}
                            onClick={() => goTo(`${sectionKey}/${subKey}/${childKey}`)}
                          >
                            {childValue.label}
                          </MenuItem>
                        ))}
                      </Menu>
                    </MenuItem>
                  ) : (
                    <MenuItem key={subKey} onClick={() => goTo(`${sectionKey}/${subKey}`)}>
                      {subValue.label}
                    </MenuItem>
                  );
                })}
            </Menu>
          </Box>
        ))}
      </Box>
      <Outlet />
    </>
  );
};

export default MainNav;
