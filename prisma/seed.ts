import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin
  const email = process.env.ADMIN_EMAIL || "admin@empresa.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (!existing) {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.admin.create({ data: { email, password: hashed, name: "Administrador" } });
    console.log("✅ Admin creado:", email);
  }

  // Demo jobs
  const count = await prisma.job.count();
  if (count === 0) {
    await prisma.job.createMany({
      data: [
        {
          title: "Desarrollador Full Stack Senior",
          department: "Tecnología",
          location: "Buenos Aires / Remoto",
          type: "Full-time",
          description: "Buscamos un desarrollador Full Stack con experiencia en React y Node.js para unirse a nuestro equipo de producto.\n\nResponsabilidades:\n- Desarrollar y mantener aplicaciones web usando React y Node.js\n- Colaborar con el equipo de diseño y producto\n- Participar en revisiones de código y definición de arquitectura\n- Proponer mejoras técnicas y buenas prácticas",
          requirements: "- +4 años de experiencia en desarrollo web\n- Sólido conocimiento de React, TypeScript y Node.js\n- Experiencia con bases de datos relacionales y no relacionales\n- Familiaridad con metodologías ágiles\n- Inglés intermedio-avanzado (lectura técnica y comunicación escrita)",
          isActive: true,
        },
        {
          title: "Analista de Recursos Humanos",
          department: "RRHH",
          location: "Buenos Aires",
          type: "Full-time",
          description: "Nos encontramos en búsqueda de un Analista de RRHH para apoyar los procesos de selección, onboarding y gestión del talento.\n\nResponsabilidades:\n- Gestionar el ciclo completo de reclutamiento y selección\n- Coordinar el proceso de onboarding de nuevos ingresos\n- Mantener actualizada la base de datos de candidatos\n- Apoyar en la implementación de iniciativas de clima organizacional",
          requirements: "- Licenciatura en RRHH, Psicología o afines\n- +2 años de experiencia en posiciones similares\n- Experiencia en uso de ATS y herramientas de selección\n- Excelentes habilidades de comunicación y empatía\n- Orientación al resultado y atención al detalle",
          isActive: true,
        },
        {
          title: "Diseñador UX/UI",
          department: "Diseño",
          location: "Remoto",
          type: "Híbrido",
          description: "Buscamos un diseñador UX/UI apasionado por crear experiencias de usuario intuitivas y atractivas.\n\nResponsabilidades:\n- Diseñar wireframes, prototipos y flujos de usuario\n- Colaborar estrechamente con el equipo de producto y desarrollo\n- Realizar investigaciones de usuario y pruebas de usabilidad\n- Mantener y evolucionar el design system de la empresa",
          requirements: "- Portfolio demostrable con proyectos de UX/UI\n- Dominio de Figma u otras herramientas de diseño\n- Conocimiento de principios de diseño centrado en el usuario\n- Capacidad para trabajar en equipo y recibir feedback constructivo\n- Experiencia con design systems es un plus",
          isActive: true,
        },
      ],
    });
    console.log("✅ Puestos de demo creados");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
