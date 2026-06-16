import { defineConfig } from 'vite';

export default defineConfig({
  root: 'cliente', // Le dice a Vite que todo tu frontend está en la carpeta cliente
  build: {
    outDir: '../dist', // Saca la compilación a la raíz del proyecto
  }
});