// Material Dashboard 2 React Base Styles
import colors from "assets/theme/base/colors";

const { info, dark } = colors;

const globals = {
  html: {
    scrollBehavior: "smooth",
  },
  "*, *::before, *::after": {
    margin: 0,
    padding: 0,
  },
  "a, a:link, a:visited": {
    textDecoration: "none !important",
  },
  "a.link, .link, a.link:link, .link:link, a.link:visited, .link:visited": {
    color: `${dark.main} !important`,
    transition: "color 150ms ease-in !important",
  },
  "a.link:hover, .link:hover, a.link:focus, .link:focus": {
    color: `${info.main} !important`,
  },

  /* ===== PRINT: estilo do cabeçalho (compacto) ===== */
  ".print-header h2": {
    fontSize: "16px",
    margin: "0 0 4px 0",
  },
  ".print-subtitle": {
    fontSize: "11px",
    margin: "0 0 2px 0",
  },
  ".print-meta": {
    fontSize: "10px",
    opacity: 0.8,
    margin: 0,
  },

  /* some na tela (aparece só no print) */
  ".print-only": {
    display: "none",
  },

  "@media print": {
    "@page": {
      size: "landscape",
      margin: "12mm",
    },

    "body *": {
      visibility: "hidden",
    },

    "#print-area, #print-area *": {
      visibility: "visible",
    },

    "#print-area": {
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
    },

    ".no-print": {
      display: "none !important",
    },

    ".print-only": {
      display: "block !important",
    },



"#print-area nav, #print-area ul": {
display: "none !important",
},

    ".MuiPagination-root, .MuiPagination-ul, .MuiPaginationItem-root, .MuiTablePagination-root, nav[aria-label='pagination']": {
  display: "none !important",
},


    "#print-area table": {
      width: "100%",
      borderCollapse: "collapse",
    },

    "#print-area th, #print-area td": {
      border: "1px solid #999",
      padding: "6px 8px",
      fontSize: "12px",
    },
    /* mata QUALQUER paginação dentro do print */
"#print-area .MuiPagination-root, #print-area .MuiPagination-ul, #print-area nav, #print-area .MuiTablePagination-root": {
display: "none !important",
},


/* fallback pra paginação custom do template (caso não seja MUI Pagination) */
"#print-area [class*='Pagination'], #print-area [class*='pagination']": {
display: "none !important",
},

/* mais espaço entre cabeçalho e tabela */
"#print-area .print-header": {
marginBottom: "14px",
},


/* garante alinhamento consistente */
"#print-area th": {
textAlign: "left",
verticalAlign: "top",
},
"#print-area td": {
textAlign: "left",
verticalAlign: "top",
},


/* opcional: melhora visual do header da tabela */
"#print-area thead th": {
fontWeight: 700,
backgroundColor: "#f3f3f3",
},


/* opcional: zebra nas linhas */
"#print-area tbody tr:nth-of-type(even) td": {
backgroundColor: "#fafafa",
},


/* opcional: controla quebra de texto (principalmente descrição) */
"#print-area td": {
whiteSpace: "normal",
wordBreak: "break-word",
},

  },
};

export default globals;
