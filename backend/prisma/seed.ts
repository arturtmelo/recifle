import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "senha123";

// Coordenadas em torno de São Paulo (SP) para os dados de demonstração
async function main() {
  console.log("Limpando dados existentes...");
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.negotiation.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.centerMaterial.deleteMany();
  await prisma.centerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("Criando centros de reciclagem...");
  const centro1 = await prisma.user.create({
    data: {
      name: "EcoPonto Vila Verde",
      email: "centro1@reclicla.com",
      passwordHash,
      role: "CENTRO",
      phone: "(11) 91234-0001",
      addressText: "Rua das Palmeiras, 120 - Vila Verde, São Paulo - SP",
      lat: -23.561,
      lng: -46.6558,
      totalKgRecycled: 1280,
      dealsCompleted: 34,
      centerProfile: {
        create: {
          description: "Cooperativa especializada em plásticos e metais. Recebemos de segunda a sábado.",
          openingHours: "Seg-Sáb, 8h às 18h",
          verified: true,
          materials: { create: [{ materialType: "PLASTICO" }, { materialType: "METAL" }, { materialType: "VIDRO" }] },
        },
      },
    },
  });

  const centro2 = await prisma.user.create({
    data: {
      name: "Cooperativa Recicla Mais",
      email: "centro2@reclicla.com",
      passwordHash,
      role: "CENTRO",
      phone: "(11) 91234-0002",
      addressText: "Av. Industrial, 900 - Mooca, São Paulo - SP",
      lat: -23.5505,
      lng: -46.6033,
      totalKgRecycled: 3420,
      dealsCompleted: 87,
      centerProfile: {
        create: {
          description: "Focados em papel e eletrônicos, com coleta agendada.",
          openingHours: "Seg-Sex, 7h às 17h",
          verified: true,
          materials: { create: [{ materialType: "PAPEL" }, { materialType: "ELETRONICO" }, { materialType: "PLASTICO" }] },
        },
      },
    },
  });

  const centro3 = await prisma.user.create({
    data: {
      name: "Ponto Verde Pinheiros",
      email: "centro3@reclicla.com",
      passwordHash,
      role: "CENTRO",
      phone: "(11) 91234-0003",
      addressText: "Rua Teodoro Sampaio, 500 - Pinheiros, São Paulo - SP",
      lat: -23.5629,
      lng: -46.6873,
      totalKgRecycled: 640,
      dealsCompleted: 19,
      centerProfile: {
        create: {
          description: "Pequeno ponto de coleta comunitário, aceita óleo e orgânicos para compostagem.",
          openingHours: "Todos os dias, 9h às 19h",
          verified: false,
          materials: { create: [{ materialType: "OLEO" }, { materialType: "ORGANICO" }, { materialType: "VIDRO" }] },
        },
      },
    },
  });

  console.log("Criando usuários população/fornecedor...");
  const populacao1 = await prisma.user.create({
    data: {
      name: "Marina Souza",
      email: "populacao@reclicla.com",
      passwordHash,
      role: "POPULACAO",
      phone: "(11) 98888-1111",
      addressText: "Rua Augusta, 1500 - Consolação, São Paulo - SP",
      lat: -23.5558,
      lng: -46.6608,
      totalKgRecycled: 42,
      dealsCompleted: 3,
    },
  });

  const fornecedor1 = await prisma.user.create({
    data: {
      name: "Distribuidora Bom Destino",
      email: "fornecedor@reclicla.com",
      passwordHash,
      role: "FORNECEDOR",
      phone: "(11) 97777-2222",
      addressText: "Av. Paulista, 2000 - Bela Vista, São Paulo - SP",
      lat: -23.5615,
      lng: -46.6558,
      totalKgRecycled: 890,
      dealsCompleted: 21,
    },
  });

  console.log("Criando anúncios...");
  await prisma.listing.create({
    data: {
      ownerId: populacao1.id,
      materialType: "PLASTICO",
      title: "Garrafas PET limpas (aprox. 15kg)",
      description: "Garrafas PET separadas e lavadas, acumuladas ao longo do mês.",
      quantityKg: 15,
      priceType: "DOACAO",
      addressText: populacao1.addressText,
      lat: populacao1.lat,
      lng: populacao1.lng,
    },
  });

  await prisma.listing.create({
    data: {
      ownerId: populacao1.id,
      materialType: "VIDRO",
      title: "Potes e garrafas de vidro variados",
      description: "Cerca de 20kg de vidro, entre potes de conserva e garrafas.",
      quantityKg: 20,
      priceType: "DOACAO",
      addressText: populacao1.addressText,
      lat: populacao1.lat,
      lng: populacao1.lng,
    },
  });

  await prisma.listing.create({
    data: {
      ownerId: fornecedor1.id,
      materialType: "PAPEL",
      title: "Lote de papelão de embalagens (120kg)",
      description: "Papelão limpo e seco, sobra de embalagens de distribuição. Retirada facilitada com empilhadeira.",
      quantityKg: 120,
      priceType: "VENDA",
      pricePerKg: 0.35,
      addressText: fornecedor1.addressText,
      lat: fornecedor1.lat,
      lng: fornecedor1.lng,
    },
  });

  await prisma.listing.create({
    data: {
      ownerId: fornecedor1.id,
      materialType: "METAL",
      title: "Aparas de alumínio industrial (80kg)",
      description: "Aparas limpas de processo produtivo, prontas para retirada.",
      quantityKg: 80,
      priceType: "VENDA",
      pricePerKg: 4.2,
      addressText: fornecedor1.addressText,
      lat: fornecedor1.lat,
      lng: fornecedor1.lng,
    },
  });

  await prisma.listing.create({
    data: {
      ownerId: fornecedor1.id,
      materialType: "ELETRONICO",
      title: "Placas e componentes eletrônicos obsoletos",
      description: "Lote de sucata eletrônica de equipamentos descartados, aprox. 30kg.",
      quantityKg: 30,
      priceType: "VENDA",
      pricePerKg: 2.1,
      addressText: fornecedor1.addressText,
      lat: fornecedor1.lat,
      lng: fornecedor1.lng,
    },
  });

  console.log("Seed concluído!");
  console.log("Contas de demonstração (senha para todas: senha123):");
  console.log(" - centro1@reclicla.com (Centro: EcoPonto Vila Verde)");
  console.log(" - centro2@reclicla.com (Centro: Cooperativa Recicla Mais)");
  console.log(" - centro3@reclicla.com (Centro: Ponto Verde Pinheiros)");
  console.log(" - populacao@reclicla.com (População: Marina Souza)");
  console.log(" - fornecedor@reclicla.com (Fornecedor: Distribuidora Bom Destino)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
