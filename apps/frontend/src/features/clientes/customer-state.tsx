import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

export function CustomerListLoading() {
  return (
    <Box role="status" aria-label="Cargando clientes" sx={{ px: 2.25, py: 1 }}>
      {Array.from({ length: 7 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 1.4fr) minmax(155px, 0.8fr) minmax(155px, 0.8fr) 96px",
            gap: 2,
            alignItems: "center",
            minHeight: 76,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Skeleton width={`${58 + (index % 3) * 8}%`} height={22} />
            <Skeleton width="82%" height={18} />
          </Box>
          <Box>
            <Skeleton width="72%" height={18} />
            <Skeleton width="88%" height={18} />
          </Box>
          <Box>
            <Skeleton width="76%" height={18} />
            <Skeleton width="60%" height={18} />
          </Box>
          <Skeleton variant="rounded" width={78} height={34} />
        </Box>
      ))}
    </Box>
  );
}

type CustomerStateProps = {
  kind: "error" | "empty" | "no-results";
  onAction?: () => void;
};

const stateContent = {
  error: {
    icon: ErrorOutlineRoundedIcon,
    title: "No pudimos cargar los clientes",
    description: "Comprueba la conexión e inténtalo nuevamente.",
    action: "Reintentar",
  },
  empty: {
    icon: PeopleOutlineRoundedIcon,
    title: "Aún no hay clientes",
    description: "Los clientes registrados aparecerán aquí cuando exista información disponible.",
    action: undefined,
  },
  "no-results": {
    icon: PersonSearchOutlinedIcon,
    title: "No encontramos coincidencias",
    description: "Prueba otra búsqueda o elimina algunos filtros para ampliar los resultados.",
    action: "Limpiar búsqueda y filtros",
  },
} as const;

export function CustomerState({ kind, onAction }: CustomerStateProps) {
  const content = stateContent[kind];
  const Icon = content.icon;

  return (
    <Box
      role={kind === "error" ? "alert" : "status"}
      sx={{
        display: "grid",
        minHeight: 430,
        placeItems: "center",
        px: 3,
        py: 7,
        textAlign: "center",
      }}
    >
      <Box sx={{ maxWidth: 430 }}>
        <Box
          sx={{
            display: "grid",
            width: 58,
            height: 58,
            mx: "auto",
            mb: 2.5,
            placeItems: "center",
            color: kind === "error" ? "#A33C3C" : "primary.main",
            backgroundColor: kind === "error" ? "#FFF0F0" : "#EEF6FD",
            borderRadius: "16px",
          }}
        >
          <Icon sx={{ fontSize: 28 }} />
        </Box>
        <Typography component="h2" sx={{ fontSize: "1.08rem", fontWeight: 700 }}>
          {content.title}
        </Typography>
        <Typography sx={{ mt: 0.75, color: "text.secondary", fontSize: "0.88rem", lineHeight: 1.55 }}>
          {content.description}
        </Typography>
        {content.action && onAction && (
          <Button variant="outlined" onClick={onAction} sx={{ mt: 2.5 }}>
            {content.action}
          </Button>
        )}
      </Box>
    </Box>
  );
}
