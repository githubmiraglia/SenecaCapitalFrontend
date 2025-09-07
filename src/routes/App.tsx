import React, { useState, lazy } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./RootLayout";
import MainNav from "./MainNav";
import LoginPage from "./LoginPage";
import { navigationMap } from "../variables/navigationMap";
import { currentVariables } from "../variables/generalVariables";
import { AcessoAFundos, UserPermissions } from "../types/Types";

// Converts strings like "cri-operacoes", "tabelas_backend", "foo/bar"
// into PascalCase filenames like "CriOperacoes", "TabelasBackend", "FooBar"
const normalizeComponentName = (name: string) => {
  const customMap: Record<string, string> = {
    todososdados: "TodosOsDados",
    tabelasdoservidor: "Tabelas_do_servidor",
  };
  const key = name.toLowerCase();
  if (customMap[key]) return customMap[key];

  return name
    .split(/[\/_\-]/g)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
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
      // Top-level node without children
      if (!hasChildren(sectionValue)) {
        const Component = lazy(() =>
          import(/* @vite-ignore */ `../routes/${sectionKey}/${normalizeComponentName(sectionKey)}`)
        );

        routes.push({
          path: `/${sectionKey.toLowerCase()}`, // absolute path
          element: (
            <React.Suspense fallback={<div>Loading…</div>}>
              <Component />
            </React.Suspense>
          ),
        });
        return;
      }

      // Children (2nd level)
      Object.entries(sectionValue.children).forEach(([childKey, childValue]) => {
        const basePath = `${sectionKey}/${childKey}`;

        if (!hasChildren(childValue)) {
          const Component = lazy(() =>
            import(
              /* @vite-ignore */ `../routes/${sectionKey}/${normalizeComponentName(childKey)}`
            )
          );
          routes.push({
            path: `/${basePath.toLowerCase()}`, // absolute path
            element: (
              <React.Suspense fallback={<div>Loading…</div>}>
                <Component />
              </React.Suspense>
            ),
          });
          return;
        }

        // Grandchildren (3rd level)
        Object.entries(childValue.children).forEach(([grandKey]) => {
          const fullPath = `${sectionKey}/${childKey}/${grandKey}`;
          const componentPath = `../routes/${sectionKey}/${childKey}/${normalizeComponentName(
            grandKey
          )}`;

          const Component = lazy(() => import(/* @vite-ignore */ componentPath));

          routes.push({
            path: `/${fullPath.toLowerCase()}`, // absolute path
            element: (
              <React.Suspense fallback={<div>Loading…</div>}>
                <Component />
              </React.Suspense>
            ),
          });
        });
      });
    });

    // Debug: see which paths were built
    console.log("Routes:", routes.map((r) => r.path));
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
