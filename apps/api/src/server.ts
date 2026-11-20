import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import companyRoutes from "./modules/companies/company.routes";
import productRoutes from "./modules/products/product.routes";
import saleRoutes from "./modules/sales/sale.routes"; 
import expenseRoutes from "./modules/expenses/expense.routes"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "BizPilot API is running" });
});

app.use("/auth", authRoutes);
app.use("/companies", companyRoutes);
app.use("/products", productRoutes);
app.use("/sales", saleRoutes); 
app.use("/expenses", expenseRoutes);

app.listen(PORT, () => {
  console.log(`🚀 BizPilot API running on http://localhost:${PORT}`);
});