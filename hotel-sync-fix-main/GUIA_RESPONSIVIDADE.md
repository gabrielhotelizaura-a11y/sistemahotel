# 📱 GUIA DE RESPONSIVIDADE - HOTEL SYNC

## 🎯 Estrutura do Projeto

```
src/
├── pages/
│   ├── dashboard/
│   │   ├── Rooms.tsx          ← 🏨 Lista de quartos
│   │   ├── Reservations.tsx   ← 📅 Reservas ativas
│   │   ├── FutureReservations.tsx ← 📆 Reservas futuras
│   │   ├── Prices.tsx         ← 💰 Gerenciar preços
│   │   └── Statistics.tsx     ← 📊 Estatísticas
│   └── Auth.tsx               ← 🔐 Login/Cadastro
├── components/
│   ├── AppSidebar.tsx         ← 📱 Menu lateral (já responsivo)
│   └── ui/                    ← Componentes shadcn (já responsivos)
└── index.css                  ← 🎨 Estilos globais
```

---

## 📏 Breakpoints Tailwind

```css
/* Mobile first! */
default:  < 640px    /* Celular */
sm:       640px      /* Celular grande */
md:       768px      /* Tablet */
lg:       1024px     /* Desktop pequeno */
xl:       1280px     /* Desktop grande */
2xl:      1536px     /* Desktop muito grande */
```

---

## 🎨 Classes mais usadas para mobile

### 1️⃣ **Grid Responsivo**
```tsx
// ✅ JÁ ESTÁ RESPONSIVO em Rooms.tsx linha 252
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//              1 coluna     2 colunas    3 colunas    4 colunas
//              mobile       tablet       desktop      desktop++
```

### 2️⃣ **Flex Responsivo**
```tsx
// Empilhar no mobile, lado a lado no desktop
<div className="flex flex-col md:flex-row gap-4">
//              ↑ mobile      ↑ desktop
```

### 3️⃣ **Texto Responsivo**
```tsx
<h1 className="text-xl md:text-2xl lg:text-3xl">
//              mobile  tablet      desktop

<p className="text-sm md:text-base">
//             mobile  desktop
```

### 4️⃣ **Padding/Margin Responsivo**
```tsx
<div className="p-2 md:p-4 lg:p-6">
//              mobile tablet desktop

<div className="space-y-2 md:space-y-4">
//              espaçamento vertical
```

### 5️⃣ **Esconder/Mostrar no Mobile**
```tsx
<div className="hidden md:block">Só aparece no desktop</div>
<div className="block md:hidden">Só aparece no mobile</div>
```

---

## 🔧 Onde mexer em cada página:

### 📄 **Rooms.tsx** (linha 252) ✅ JÁ RESPONSIVO
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

### 📄 **Reservations.tsx** - Verificar tabelas
```tsx
// Se tiver <Table>, adicionar scroll horizontal:
<div className="overflow-x-auto">
  <Table>...</Table>
</div>
```

### 📄 **Statistics.tsx** - Cards de estatísticas
```tsx
// Mudar grid se necessário:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## 🚀 Comandos úteis

```bash
# Ver o site no celular (mesma rede Wi-Fi):
npm run dev
# Acesse: http://192.168.X.X:8080 (IP aparece no terminal)

# Build de produção:
npm run build

# Preview da build:
npm run preview
```

---

## 📱 Testando no celular

### Opção 1: Simulador do navegador
1. **Chrome/Safari DevTools** (F12)
2. Clicar no ícone de **celular** 📱
3. Escolher dispositivo (iPhone, Samsung, etc)

### Opção 2: Celular real
1. Certifique-se que está na **mesma rede Wi-Fi**
2. Rode `npm run dev`
3. Acesse o IP que aparece no terminal (ex: `http://192.168.100.193:8080`)

---

## 🎯 Dicas importantes:

1. **Mobile First!** - Comece pensando no mobile, depois adicione `md:` e `lg:`
2. **Teste sempre** - Use DevTools para ver em vários tamanhos
3. **Botões grandes** - No mobile, botões precisam ser maiores (min 44x44px)
4. **Texto legível** - Mínimo `text-sm` (14px) no mobile
5. **Espaçamento** - Use mais `gap-4` ou `space-y-4` no mobile

---

## 🔍 Exemplos práticos:

### Transformar header não responsivo:
```tsx
// ❌ Antes (fica apertado no mobile)
<div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold">Quartos</h1>
  <Button>Adicionar Quarto</Button>
</div>

// ✅ Depois (empilha no mobile)
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <h1 className="text-2xl md:text-3xl font-bold">Quartos</h1>
  <Button className="w-full md:w-auto">Adicionar Quarto</Button>
</div>
```

### Card responsivo:
```tsx
<Card className="p-4 md:p-6">
  <CardHeader className="p-0 pb-4">
    <CardTitle className="text-lg md:text-xl">Título</CardTitle>
  </CardHeader>
  <CardContent className="p-0 space-y-2 md:space-y-4">
    {/* conteúdo */}
  </CardContent>
</Card>
```

---

## 📚 Recursos:

- **Tailwind Docs**: https://tailwindcss.com/docs/responsive-design
- **Shadcn/ui**: https://ui.shadcn.com/ (componentes já responsivos)
- **Mobile DevTools**: Chrome → F12 → Toggle device toolbar

---

**Quer que eu deixe alguma página específica mais responsiva? Me diga qual! 📱**
