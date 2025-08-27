import React, { useState, lazy } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./RootLayout";
import MainNav from "./MainNav";
import LoginPage from "./LoginPage";
import { navigationMap } from "../variables/navigationMap";
import { currentVariables } from "../variables/generalVariables";
import { AcessoAFundos, UserPermissions } from "../types/Types";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ✅ Fix: correct mapping for special cases
const normalizeComponentName = (name: string) => {
  const customMap: Record<string, string> = {
    todososdados: "TodosOsDados",
    tabelasdoservidor: "Tabelas_do_servidor",
  };
  return customMap[name.toLowerCase()] || capitalize(name);
};

const hasChildren = (node: any): node is { children: Record<string, any> } =>
  typeof node === "object" && node !== null && "children" in node;

const App: React.FC = () => {
  const [, forceRerender] = useState(0);

  const handleLogin = () => {
    const hasToken = !!currentVariables.user.token;
    if (hasToken) {
      currentVariables.session.isAuthenticated = true;
      forceRerender((prev) => prev + 1);
    }
  };

  const generateRoutes = () => {
    const routes: any[] = [];

    Object.entries(navigationMap).forEach(([sectionKey, sectionValue]) => {
      if (!hasChildren(sectionValue)) return;

      Object.entries(sectionValue.children).forEach(([childKey, childValue]) => {
        const basePath = `${sectionKey}/${childKey}`;

        if (!hasChildren(childValue)) {
          // ✅ Corrected relative path
          const Component = lazy(() =>
            import(`../routes/${sectionKey}/${normalizeComponentName(childKey)}`)
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

        Object.entries(childValue.children).forEach(([grandKey, _]) => {
          const fullPath = `${sectionKey}/${childKey}/${grandKey}`;
          const componentPath = `../routes/${sectionKey}/${childKey}/${normalizeComponentName(grandKey)}`;

          // ✅ Corrected relative path
          const Component = lazy(() => import(componentPath));
          routes.push({
            path: fullPath,
            element: (
              <React.Suspense fallback={<div>Loading…</div>}>
                <Component />
              </React.Suspense>
            ),
          });
        });
      });
    });

    return routes;
  };

  const getRouter = () =>
    currentVariables.session.isAuthenticated
      ? createBrowserRouter([
          {
            path: "/",
            element: <RootLayout />,
            children: [
              {
                path: "/",
                element: (
                  <MainNav userPermissions={currentVariables.permissions.fullPermissions} />
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
