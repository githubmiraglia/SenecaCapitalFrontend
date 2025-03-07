import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import axios from "axios";
import { createProduct, getProducts } from "../api";

type Product = {
    id: number;
    nome: string;
    preco: number;
    descricao: string;
    };

const Products = () => {
  const [products, setProducts] = useState([] as Product[]);
  const [open, setOpen] = useState(false);
  const [productData, setProductData] = useState({ nome: "", preco: "", descricao: "" });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response);
    } catch (error) {
      console.error("Erro ao buscar produtos", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: any) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await createProduct(productData);
      fetchProducts(); // Atualiza a lista
      handleClose();
    } catch (error) {
      console.error("Erro ao cadastrar produto", error);
    }
  };

  return (
    <Container>
      <h2>Lista de Produtos</h2>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Cadastrar Produto
      </Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Descrição</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.nome}</TableCell>
                <TableCell>{product.preco}</TableCell>
                <TableCell>{product.descricao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para cadastro de produto */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Cadastrar Produto</DialogTitle>
        <DialogContent>
          <TextField label="Nome" name="nome" fullWidth margin="dense" onChange={handleChange} />
          <TextField label="Preço" name="preco" type="number" fullWidth margin="dense" onChange={handleChange} />
          <TextField label="Descrição" name="descricao" fullWidth margin="dense" onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Products;