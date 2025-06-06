import React, { useState, lazy } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./RootLayout";
import MainNav from "./MainNav";
import LoginPage from "./LoginPage";
import { navigationMap } from "../variables/navigationMap";
import { currentVariables } from "../variables/generalVariables";
import { AcessoAFundos, UserPermissions } from "../types/Types";

// Type guard to check if a node has children
const hasChildren = (node: any): node is { children: Record<string, any> } =>
  typeof node === "object" && node !== null && "children" in node;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const App: React.FC = () => {
  const [, forceRerender] = useState(0);

  console.log("🔑 Token at render:", currentVariables.user.token);
  console.log("📜 Full permissions at render:", currentVariables.permissions.fullPermissions);
  console.log("🧭 isAuthenticated state:", currentVariables.session.isAuthenticated);

  const handleLogin = () => {
    console.log("✅ handleLogin called");
    const hasPermissions =
      Object.keys(currentVariables.permissions.fullPermissions || {}).length > 0;
    const hasToken = !!currentVariables.user.token;

    console.log("📦 Permissions present?", hasPermissions);
    console.log("🔑 Token at login:", hasToken);

    if (hasPermissions && hasToken) {
      currentVariables.session.isAuthenticated = true;
      forceRerender((prev) => prev + 1);
      console.log("🔓 User authenticated, rendering app...");
    } else {
      console.warn("🚫 Login data incomplete — not authenticating");
    }
  };

  const generateRoutes = () => {
    const routes: any[] = [];

    Object.entries(navigationMap).forEach(([sectionKey, sectionValue]) => {
      if (!hasChildren(sectionValue)) return;

      Object.entries(sectionValue.children).forEach(([childKey, childValue]) => {
        const basePath = `${sectionKey}/${childKey}`;

        // Leaf route (e.g., fundo/fundo)
        if (!hasChildren(childValue)) {
          const Component = lazy(() =>
            import(`./${sectionKey}/${capitalize(childKey)}`)
          );
          routes.push({
            path: basePath,
            element: (
              <React.Suspense fallback={<div>Loading…</div>}>
                <Component />
              </React.Suspense>
            ),
          });
          return;
        }

        // Nested (e.g., demonstracoes/balanco/balanco_administrador)
        Object.entries(childValue.children).forEach(([grandKey, grandValue]) => {
          const fullPath = `${sectionKey}/${childKey}/${grandKey}`;
          const componentPath = `./${sectionKey}/${childKey}/${capitalize(grandKey)}`;

          if (
            sectionKey === "cadastros" &&
            childKey === "usuarios" &&
            grandKey === "usuariospage"
          ) {
            const UsuariosPage = lazy(() => import(componentPath));
            routes.push({
              path: fullPath,
              element: (
                <React.Suspense fallback={<div>Loading…</div>}>
                  <UsuariosPage
                    chosenPermissions={currentVariables.permissions.chosenPermissions}
                    setChosenPermissions={(p: UserPermissions) =>
                      (currentVariables.permissions.chosenPermissions = p)
                    }
                    chosenFunds={currentVariables.permissions.chosenFunds}
                    setChosenFunds={(f: AcessoAFundos) =>
                      (currentVariables.permissions.chosenFunds = f)
                    }
                  />
                </React.Suspense>
              ),
            });
          } else {
            const Component = lazy(() => import(componentPath));
            routes.push({
              path: fullPath,
              element: (
                <React.Suspense fallback={<div>Loading…</div>}>
                  <Component />
                </React.Suspense>
              ),
            });
          }
        });
      });
    });

    return routes;
  };

  const getRouter = () =>
    currentVariables.session.isAuthenticated &&
    Object.keys(currentVariables.permissions.fullPermissions || {}).length > 0
      ? createBrowserRouter([
          {
            path: "/",
            element: <RootLayout />,
            children: [
              {
                path: "/",
                element: (
                  <MainNav
                    userPermissions={currentVariables.permissions.fullPermissions}
                  />
                ),
                children: generateRoutes(),
              },
            ],
          },
        ])
      : null;

  const router = getRouter();

  return router ? (
    <RouterProvider router={router} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
};

export default App;
