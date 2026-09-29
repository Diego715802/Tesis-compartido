import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Box
      aria-label="ComeCore — Controla, conecta y crece"
      sx={{
        position: "relative",
        display: "flex",
        minWidth: compact ? 124 : { xs: 132, sm: 158 },
        height: compact ? 42 : 44,
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: compact ? 40 : 44,
          height: compact ? 40 : 44,
          flex: compact ? "0 0 40px" : "0 0 44px",
        }}
      >
        <Image
          src="/brand/comecore-controla-conecta-crece.png"
          alt="ComeCore — Controla, conecta y crece"
          fill
          sizes={compact ? "40px" : "44px"}
          priority
          style={{ objectFit: "contain" }}
        />
      </Box>

      <Box sx={{ ml: compact ? 0.8 : 1 }}>
        <Typography
          component="div"
          sx={{
            color: "text.primary",
            fontSize: compact ? "1rem" : { xs: "1rem", sm: "1.08rem" },
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          Come
          <Box component="span" sx={{ color: "primary.main" }}>
            Core
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}
