// Protótipo histórico da tela "Explorar" — IpêBook.
// Este arquivo não é importado pelas rotas do Expo e não é código de produção. Ele registra a
// referência visual histórica; a implementação real está em src/view/search/search.tsx e
// src/view/search/FilterSheet.tsx.
// Os componentes locais abaixo são deliberadamente didáticos e não substituem os componentes
// compartilhados de src/view/components/.

import React, { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { tokens } from "@/view/tokens";

// ---------------------------------------------------------------------------
// Tipos de dados (inferidos do enunciado: capa, título, autor, bairro, modalidade)
// ---------------------------------------------------------------------------
type Modalidade = "venda" | "troca" | "doacao";

interface Livro {
  id: string;
  titulo: string;
  autor: string;
  bairro: string;
  modalidade: Modalidade;
}

// ---------------------------------------------------------------------------
// BookCover (Capa ilustrativa) — 04-componentes/capa-ilustrativa.md
// Variante histórica da rodada de teste (44 px, só a arte, sem texto sobreposto).
// ---------------------------------------------------------------------------
const CORES_CAPA = [
  tokens.colors.cover.blue,
  tokens.colors.cover.brown,
  tokens.colors.cover.green,
] as const;

function hashSimples(id: string): number {
  return [...id].reduce((soma, c) => soma + c.charCodeAt(0), 0);
}

function BookCover({ idAnuncio, titulo }: { idAnuncio: string; titulo: string }) {
  const cor = CORES_CAPA[hashSimples(idAnuncio) % CORES_CAPA.length];
  return (
    <View
      accessibilityLabel={`Capa ilustrativa de ${titulo}`}
      style={{
        backgroundColor: cor,
        borderRadius: tokens.radius.large,
        width: 44,
        aspectRatio: 120 / 170,
        // elevation-1 em capas, conforme 02-tokens.md / 03-fundamentos.md
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Tag — 04-componentes/tag.md (não interativa, nome por extenso + cor fixa)
// ---------------------------------------------------------------------------
function Tag({ tipo }: { tipo: Modalidade }) {
  const mapa = {
    venda: {
      bg: tokens.colors.badge.sale.background,
      texto: tokens.colors.badge.sale.text,
      rotulo: "Venda",
    },
    troca: {
      bg: tokens.colors.badge.trade.background,
      texto: tokens.colors.badge.trade.text,
      rotulo: "Troca",
    },
    doacao: {
      bg: tokens.colors.badge.donation.background,
      texto: tokens.colors.badge.donation.text,
      rotulo: "Doação",
    },
  } as const;
  const { bg, texto, rotulo } = mapa[tipo];
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: tokens.radius.full,
        paddingHorizontal: tokens.spacing[12],
        paddingVertical: tokens.spacing[6],
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: texto, ...tokens.typography.labelMedium }}>{rotulo}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Campo de busca — composição didática do protótipo histórico. A implementação compartilhada
// usada pelo app está em src/view/components/SearchField.tsx.
// ---------------------------------------------------------------------------
function CampoDeBusca({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View
      accessibilityRole="search"
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: tokens.colors.m3.surfaceContainerHigh,
        borderRadius: tokens.radius.full,
        paddingHorizontal: tokens.spacing[16],
        height: 48, // alvo de toque mínimo de 48 dp (06-acessibilidade.md)
      }}
    >
      <Text
        // O protótipo usa um caractere para manter o arquivo autônomo; a produção usa AppIcon.
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{ color: tokens.colors.secondaryText, marginRight: tokens.spacing[8], fontSize: 20 }}
      >
        🔍
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar por título ou autor"
        accessibilityLabel="Buscar por título ou autor"
        style={{ flex: 1, color: tokens.colors.text, ...tokens.typography.bodyLarge }}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={8}
        >
          <Text style={{ color: tokens.colors.secondaryText, fontSize: 18 }}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Chip de filtro — composição didática. A implementação compartilhada está em
// src/view/components/Chip.tsx.
// ---------------------------------------------------------------------------
function ChipDeFiltro({
  rotulo,
  selecionado,
  onPress,
}: {
  rotulo: string;
  selecionado: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
      accessibilityLabel={rotulo}
      hitSlop={8} // amplia a área de toque até 48 dp (chip visual continua com 32 px)
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: 32,
        borderRadius: tokens.radius.full,
        paddingHorizontal: tokens.spacing[12],
        marginRight: tokens.spacing[8],
        backgroundColor: selecionado ? tokens.colors.m3.secondaryContainer : "transparent",
        borderWidth: selecionado ? 0 : 1,
        borderColor: tokens.colors.border,
      }}
    >
      {selecionado ? (
        <Text style={{ color: tokens.colors.action, marginRight: tokens.spacing[6] }}>✓</Text>
      ) : null}
      <Text
        style={{
          color: selecionado ? tokens.colors.action : tokens.colors.secondaryText,
          ...tokens.typography.labelMedium,
        }}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// BookRow (Linha de livro) — composição didática. O documento correspondente registra que o
// padrão é composto diretamente nas telas reais, em vez de um componente genérico.
// ---------------------------------------------------------------------------
function BookRow({ livro, onPress }: { livro: Livro; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${livro.titulo}, ${livro.autor}, ${livro.bairro}`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: tokens.colors.m3.surfaceContainerLow, // cartões/campos (03-fundamentos.md)
        borderRadius: tokens.radius.large,
        padding: tokens.spacing[12],
        marginBottom: tokens.spacing[8],
        minHeight: 48,
      }}
    >
      <BookCover idAnuncio={livro.id} titulo={livro.titulo} />
      <View style={{ flex: 1, marginLeft: tokens.spacing[12] }}>
        <Text
          numberOfLines={2}
          style={{
            color: tokens.colors.text,
            // Princípio 4: título do livro usa a serifa da marca.
            // O protótipo preserva a escolha tipográfica da rodada de avaliação; a produção
            // usa a tipografia definida por BookCover e pelas telas de busca/listagem.
            fontFamily: tokens.typography.brandFamily,
            fontSize: tokens.typography.bodyLarge.fontSize,
            lineHeight: tokens.typography.bodyLarge.lineHeight,
          }}
        >
          {livro.titulo}
        </Text>
        <Text
          numberOfLines={1}
          style={{ color: tokens.colors.secondaryText, ...tokens.typography.bodyMedium, marginTop: 2 }}
        >
          {livro.autor} · {livro.bairro}
        </Text>
        <View style={{ marginTop: tokens.spacing[6] }}>
          <Tag tipo={livro.modalidade} />
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Item e barra de navegação — 04-componentes/barra-de-navegacao.md
// ---------------------------------------------------------------------------
function ItemNavegacao({
  rotulo,
  ativo,
  badge,
  onPress,
}: {
  rotulo: string;
  ativo: boolean;
  badge?: number;
  onPress: () => void;
}) {
  const rotuloAcessivel = badge ? `${rotulo}, ${badge} não lidas` : rotulo;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: ativo }}
      accessibilityLabel={rotuloAcessivel}
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: ativo ? tokens.colors.m3.secondaryContainer : "transparent",
        borderRadius: tokens.radius.full,
        paddingHorizontal: tokens.spacing[16],
        paddingVertical: tokens.spacing[8],
      }}
    >
      <Text
        style={{
          color: ativo ? tokens.colors.action : tokens.colors.secondaryText,
          ...tokens.typography.labelSmall,
        }}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

function BarraDeNavegacao({ ativo }: { ativo: string }) {
  const destinos = ["Início", "Explorar", "Estante", "Conversas", "Perfil"];
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: tokens.colors.surface,
        paddingVertical: tokens.spacing[8],
        paddingHorizontal: tokens.spacing[8],
        borderTopWidth: 1,
        borderTopColor: tokens.colors.border,
      }}
    >
      {destinos.map((d) => (
        <ItemNavegacao key={d} rotulo={d} ativo={d === ativo} onPress={() => {}} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Dados de exemplo — somente para tornar o protótipo histórico executável; não são dados reais.
// ---------------------------------------------------------------------------
const LIVROS_EXEMPLO: Livro[] = [
  { id: "1", titulo: "Dom Casmurro", autor: "Machado de Assis", bairro: "Centro", modalidade: "venda" },
  { id: "2", titulo: "Grande Sertão: Veredas", autor: "Guimarães Rosa", bairro: "Jardim das Flores", modalidade: "troca" },
  { id: "3", titulo: "Torto Arado", autor: "Itamar Vieira Junior", bairro: "Vila Nova", modalidade: "doacao" },
];

// ---------------------------------------------------------------------------
// Tela Explorar
// ---------------------------------------------------------------------------
export default function ExplorarScreen() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Modalidade | "todos">("todos");

  const resultados = LIVROS_EXEMPLO.filter((l) => {
    const bate =
      l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      l.autor.toLowerCase().includes(busca.toLowerCase());
    const passaFiltro = filtro === "todos" || l.modalidade === filtro;
    return bate && passaFiltro;
  });

  return (
    <View style={{ flex: 1, backgroundColor: tokens.colors.surface }}>
      {/* Título de tela raiz — serifa da marca (Princípio 4) */}
      <Text
        style={{
          color: tokens.colors.text,
          fontFamily: tokens.typography.brandFamily,
          fontSize: tokens.typography.displayLarge.fontSize,
          lineHeight: tokens.typography.displayLarge.lineHeight,
          paddingHorizontal: tokens.spacing[16],
          paddingTop: tokens.spacing[16],
        }}
      >
        Explorar
      </Text>

      <View style={{ paddingHorizontal: tokens.spacing[16], paddingTop: tokens.spacing[16] }}>
        <CampoDeBusca value={busca} onChangeText={setBusca} />
      </View>

      {/* Chips de filtro por modalidade — dados didáticos do protótipo histórico. */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: tokens.spacing[16],
          paddingTop: tokens.spacing[16],
          paddingBottom: tokens.spacing[8],
        }}
      >
        <ChipDeFiltro rotulo="Todos" selecionado={filtro === "todos"} onPress={() => setFiltro("todos")} />
        <ChipDeFiltro rotulo="Venda" selecionado={filtro === "venda"} onPress={() => setFiltro("venda")} />
        <ChipDeFiltro rotulo="Troca" selecionado={filtro === "troca"} onPress={() => setFiltro("troca")} />
        <ChipDeFiltro rotulo="Doação" selecionado={filtro === "doacao"} onPress={() => setFiltro("doacao")} />
      </View>

      {resultados.length === 0 ? (
        // Estado vazio — composição didática; o fluxo real usa os estados de search.tsx.
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: tokens.spacing[32],
          }}
        >
          <Text style={{ color: tokens.colors.secondaryText, ...tokens.typography.bodyMedium, textAlign: "center" }}>
            Nenhum livro encontrado no seu bairro com esse termo.
          </Text>
        </View>
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: tokens.spacing[16], paddingTop: tokens.spacing[8] }}
          renderItem={({ item }) => <BookRow livro={item} onPress={() => {}} />}
          accessibilityLabel="Resultados da busca"
        />
      )}

      <BarraDeNavegacao ativo="Explorar" />
    </View>
  );
}
