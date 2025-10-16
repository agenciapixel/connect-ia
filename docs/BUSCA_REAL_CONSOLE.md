# 🔍 Como Fazer Buscas Reais - Console do Navegador

Este guia mostra como fazer buscas reais de empresas usando o console do navegador.

## 🚀 Passo a Passo

### 1. Acesse a Aplicação

```
http://localhost:8080/prospects
```

Faça login se necessário.

### 2. Abra o Console do Navegador

- **Chrome/Edge**: `F12` ou `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
- **Firefox**: `F12` ou `Ctrl+Shift+K`

### 3. Cole e Execute o Script

```javascript
// Script para buscar empresas reais via Google Places API

async function buscarEmpresas(config) {
  const { query, location, radius = 5000, type } = config;

  console.log(`🔍 Buscando: ${query} em ${location}`);
  console.log(`📍 Raio: ${radius/1000}km`);

  try {
    const response = await fetch('/api/google-places-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        location,
        radius,
        type,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ ${data.total} lugares encontrados!`);
      console.log(`💾 ${data.saved} salvos no banco`);
      console.log(`👥 ${data.prospects} prospects criados`);
      console.log(`📊 Fonte: ${data.source}`);
      console.table(data.places.map(p => ({
        Nome: p.name,
        Endereço: p.formatted_address,
        Telefone: p.phone_number || 'N/A',
        Website: p.website || 'N/A',
        Rating: p.rating || 'N/A',
      })));
      return data.places;
    } else {
      console.error('❌ Erro:', data.error);
    }
  } catch (error) {
    console.error('❌ Erro na busca:', error);
  }
}

// Buscar restaurantes em São Paulo
await buscarEmpresas({
  query: 'restaurantes',
  location: 'Pinheiros, São Paulo, SP',
  radius: 3000,
});
```

---

## 📋 Exemplos de Buscas Prontas

### 🍔 Restaurantes em Pinheiros

```javascript
await buscarEmpresas({
  query: 'restaurantes',
  location: 'Pinheiros, São Paulo, SP',
  radius: 2000,
});
```

### ☕ Cafeterias na Vila Madalena

```javascript
await buscarEmpresas({
  query: 'cafeteria',
  location: 'Vila Madalena, São Paulo, SP',
  radius: 1500,
  type: 'cafe',
});
```

### 💇 Salões de Beleza nos Jardins

```javascript
await buscarEmpresas({
  query: 'salão de beleza',
  location: 'Jardins, São Paulo, SP',
  radius: 3000,
  type: 'beauty_salon',
});
```

### 💪 Academias na Vila Olímpia

```javascript
await buscarEmpresas({
  query: 'academia',
  location: 'Vila Olímpia, São Paulo, SP',
  radius: 5000,
  type: 'gym',
});
```

### 🐾 Pet Shops em Moema

```javascript
await buscarEmpresas({
  query: 'pet shop',
  location: 'Moema, São Paulo, SP',
  radius: 3000,
});
```

### 🏥 Clínicas Médicas no Tatuapé

```javascript
await buscarEmpresas({
  query: 'clínica médica',
  location: 'Tatuapé, São Paulo, SP',
  radius: 5000,
  type: 'doctor',
});
```

### 🔧 Oficinas Mecânicas em Santo Amaro

```javascript
await buscarEmpresas({
  query: 'oficina mecânica',
  location: 'Santo Amaro, São Paulo, SP',
  radius: 5000,
  type: 'car_repair',
});
```

### 📚 Escolas de Idiomas no Centro

```javascript
await buscarEmpresas({
  query: 'curso de inglês',
  location: 'Centro, São Paulo, SP',
  radius: 2000,
  type: 'school',
});
```

---

## 🎯 Método Mais Fácil: Use a Interface

**Recomendação**: É mais fácil usar diretamente a interface da aplicação!

1. Acesse: http://localhost:8080/prospects
2. Clique na aba **"Buscar"**
3. Preencha os campos
4. Clique em **"Buscar Prospects"**

✅ **Vantagens**:
- Interface visual amigável
- Validação de campos
- Feedback em tempo real
- Resultados formatados
- Ações rápidas (importar, visualizar)

---

## 📊 Ver Resultados na Interface

Após executar qualquer busca (console ou interface):

### Aba "Resultados"
- Lista visual dos lugares encontrados
- Cards com todas as informações
- Links clicáveis para telefone e website

### Aba "Prospects"
- Lista completa de todos os prospects salvos
- Status de cada prospect
- Ação para importar para Contatos

---

## 🔍 Exemplos de Resultado Real

### Exemplo: Busca por "restaurantes em Pinheiros"

**Console Output**:
```
✅ 20 lugares encontrados!
💾 20 salvos no banco
👥 18 prospects criados
📊 Fonte: Google Places API

┌─────────┬────────────────────────────┬─────────────────────────┬────────────────┬──────────────────────┬────────┐
│ (index) │ Nome                       │ Endereço                │ Telefone       │ Website              │ Rating │
├─────────┼────────────────────────────┼─────────────────────────┼────────────────┼──────────────────────┼────────┤
│    0    │ 'Famiglia Mancini'         │ 'R. Avanhandava, 81...' │ '(11) 3256...' │ 'famigliamancini...' │  4.5   │
│    1    │ 'Spot'                     │ 'R. Min. Jesuíno Ca...' │ '(11) 3816...' │ 'spot.com.br'        │  4.3   │
│    2    │ 'Consulado Mineiro'        │ 'Praça Benedito Cal...' │ '(11) 3826...' │ 'consuladomineiro...'│  4.4   │
└─────────┴────────────────────────────┴─────────────────────────┴────────────────┴──────────────────────┴────────┘
```

---

## 💡 Dica: Use a Interface Web!

Para fazer buscas reais agora, **use a interface da aplicação**:

1. **Abra**: http://localhost:8080/prospects
2. **Faça login** se necessário
3. **Clique** na aba "Buscar"
4. **Preencha** os dados da busca
5. **Clique** em "Buscar Prospects"

🎉 **Você verá empresas reais imediatamente!**
