import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { RichTreeView, TreeItem, TreeItemProps } from "@mui/x-tree-view";
import FolderIcon from "@mui/icons-material/Folder";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { getRepositorioTree } from "../api";
import { currentVariables } from "../variables/generalVariables";
import "../css/Treeview.css";

export interface TreeNode {
  id: string;
  label: string;
  fullPath: string;
  children?: TreeNode[];
}

interface TreeviewProps {
  onSelectFile: (fullPath: string) => void;
}

const Treeview: React.FC<TreeviewProps> = ({ onSelectFile }) => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    //const { fundoName } = currentVariables.fundo;
    //const { classeName } = currentVariables.classe;

    getRepositorioTree()
      .then((data) => setTreeData(data))
      .catch((err) => console.error("Erro ao carregar repositório:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (
    _event: React.SyntheticEvent | null,
    itemId: string,
    isSelected: boolean
  ) => {
    if (!isSelected || !treeData) return;
    const node = findNodeById(treeData, itemId);
    if (node && !node.children) {
      onSelectFile(node.fullPath);
    }
  };

  const findNodeById = (node: TreeNode, id: string): TreeNode | null => {
    if (node.id === id) return node;
    for (const child of node.children || []) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  return (
    <Box className="treeview-container">
      <Typography variant="h6" gutterBottom sx={{ color: "#1E88E5" }}>
        Repositório de Documentos do Servidor
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : treeData ? (
        <RichTreeView
          items={[treeData]}
          onItemSelectionToggle={handleSelect}
          defaultExpandedItems={["root"]}
          slots={{
            item: (props: TreeItemProps) => {
              const isLeaf =
                !props.children || (Array.isArray(props.children) && props.children.length === 0);
              let icon = <FolderIcon fontSize="large" sx={{ mr: 1, color: "#F5DEB3" }} />;
              if (isLeaf) {
                const label = String(props.label).toLowerCase();
                if (label.endsWith(".pdf")) {
                  icon = <PictureAsPdfIcon fontSize="large" sx={{ mr: 1, color: "#F40F02" }} />;
                } else if (
                  label.endsWith(".xls") ||
                  label.endsWith(".xlsx") ||
                  label.endsWith(".xlsm")
                ) {
                  icon = <InsertDriveFileIcon fontSize="large" sx={{ mr: 1, color: "#4CAF50" }} />;
                }
              }

              return (
                <TreeItem
                  {...props}
                  label={
                    <Box display="flex" alignItems="center">
                      {icon}
                      <Typography variant="body1" sx={{ color: "#1E88E5" }}>
                        {props.label}
                      </Typography>
                    </Box>
                  }
                />
              );
            },
          }}
        />
      ) : (
        <Typography color="error">Erro ao carregar a árvore de documentos.</Typography>
      )}
    </Box>
  );
};

export default Treeview;
