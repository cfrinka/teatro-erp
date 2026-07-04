import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hash } from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL || "mysql://admin:admin123@localhost:3306/teatro-erp";
const databaseName = process.env.MYSQL_DATABASE || new URL(databaseUrl).pathname.replace(/^\//, "");
const adapter = new PrismaMariaDb(databaseUrl, { database: databaseName });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const [adminPassword, coordPassword, finPassword, recPassword, teacherPassword] = await Promise.all([
    hash("admin123", 12),
    hash("coord123", 12),
    hash("fin123", 12),
    hash("rec123", 12),
    hash("teacher123", 12),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: "admin@teatroerp.com.br" },
    update: { active: true },
    create: {
      name: "Administrador",
      email: "admin@teatroerp.com.br",
      passwordHash: adminPassword,
      role: "ADMIN",
      phone: "(11) 99999-9999",
    },
  });

  const coord = await prisma.user.upsert({
    where: { email: "coordenacao@teatroerp.com.br" },
    update: { active: true },
    create: {
      name: "Maria Coordenadora",
      email: "coordenacao@teatroerp.com.br",
      passwordHash: coordPassword,
      role: "COORDINATION",
      phone: "(11) 98888-8888",
    },
  });

  await prisma.user.upsert({
    where: { email: "financeiro@teatroerp.com.br" },
    update: { active: true },
    create: {
      name: "Carlos Financeiro",
      email: "financeiro@teatroerp.com.br",
      passwordHash: finPassword,
      role: "FINANCIAL",
      phone: "(11) 97777-7777",
    },
  });

  await prisma.user.upsert({
    where: { email: "recepcao@teatroerp.com.br" },
    update: { active: true },
    create: {
      name: "Juliana Recepcao",
      email: "recepcao@teatroerp.com.br",
      passwordHash: recPassword,
      role: "RECEPTION",
      phone: "(11) 96666-6666",
    },
  });

  const teacherSeeds = [
    { name: "Fernanda Costa", email: "fernanda@teatroerp.com.br", cpf: "12345678901", specialty: "Teatro Classico", hourlyRate: 120 },
    { name: "Ricardo Alves", email: "ricardo@teatroerp.com.br", cpf: "23456789012", specialty: "Improvisacao", hourlyRate: 150 },
    { name: "Patricia Souza", email: "patricia@teatroerp.com.br", cpf: "34567890123", specialty: "Teatro Musical", hourlyRate: 180 },
  ];

  const teachers = [];
  for (const teacherSeed of teacherSeeds) {
    const user = await prisma.user.upsert({
      where: { email: teacherSeed.email },
      update: { active: true },
      create: {
        name: teacherSeed.name,
        email: teacherSeed.email,
        passwordHash: teacherPassword,
        role: "TEACHER",
        phone: "(11) 95555-5555",
      },
    });

    const teacher = await prisma.teacher.upsert({
      where: { cpf: teacherSeed.cpf },
      update: {
        userId: user.id,
        specialty: teacherSeed.specialty,
        hourlyRate: teacherSeed.hourlyRate,
        status: "ACTIVE",
      },
      create: {
        name: teacherSeed.name,
        cpf: teacherSeed.cpf,
        phone: "(11) 95555-5555",
        email: teacherSeed.email,
        specialty: teacherSeed.specialty,
        hourlyRate: teacherSeed.hourlyRate,
        status: "ACTIVE",
        userId: user.id,
      },
    });
    teachers.push(teacher);
  }

  const courseSeeds = [
    { name: "Teatro Iniciante", description: "Curso introdutorio de teatro para iniciantes", workload: 120, enrollmentFee: 100, monthlyFee: 250, minAge: 12, maxAge: 17, maxStudents: 20 },
    { name: "Teatro Intermediario", description: "Curso para alunos com experiencia basica", workload: 160, enrollmentFee: 100, monthlyFee: 300, minAge: 15, maxAge: 25, maxStudents: 15 },
    { name: "Teatro Avancado", description: "Curso avancado para alunos experientes", workload: 200, enrollmentFee: 150, monthlyFee: 350, minAge: 18, maxAge: 99, maxStudents: 12 },
    { name: "Teatro Musical", description: "Curso com interpretacao, canto e danca", workload: 180, enrollmentFee: 150, monthlyFee: 400, minAge: 14, maxAge: 30, maxStudents: 20 },
    { name: "Improvisacao", description: "Tecnicas de improvisacao teatral", workload: 80, enrollmentFee: 80, monthlyFee: 200, minAge: 16, maxAge: 99, maxStudents: 15 },
  ];

  const courses = [];
  for (const courseSeed of courseSeeds) {
    const course =
      (await prisma.course.findFirst({ where: { name: courseSeed.name } })) ||
      (await prisma.course.create({ data: { ...courseSeed, status: "ACTIVE" } }));
    courses.push(course);
  }

  const classSeeds = [
    { courseIdx: 0, teacherIdx: 0, room: "Sala 1", weekDays: ["MONDAY", "WEDNESDAY"], startTime: "14:00", endTime: "15:30", period: "Tarde", maxStudents: 20 },
    { courseIdx: 1, teacherIdx: 1, room: "Sala 2", weekDays: ["TUESDAY", "THURSDAY"], startTime: "16:00", endTime: "17:30", period: "Tarde", maxStudents: 15 },
    { courseIdx: 2, teacherIdx: 2, room: "Sala 3", weekDays: ["MONDAY", "WEDNESDAY", "FRIDAY"], startTime: "18:00", endTime: "19:30", period: "Noite", maxStudents: 12 },
    { courseIdx: 3, teacherIdx: 2, room: "Sala 4", weekDays: ["MONDAY", "WEDNESDAY"], startTime: "19:30", endTime: "21:00", period: "Noite", maxStudents: 20 },
    { courseIdx: 4, teacherIdx: 1, room: "Sala 1", weekDays: ["SATURDAY"], startTime: "09:00", endTime: "12:00", period: "Manha", maxStudents: 15 },
  ];

  const classes = [];
  for (const classSeed of classSeeds) {
    const weekDays = JSON.stringify(classSeed.weekDays);
    const existing = await prisma.class.findFirst({
      where: {
        courseId: courses[classSeed.courseIdx].id,
        room: classSeed.room,
        weekDays,
        startTime: classSeed.startTime,
      },
    });

    const cls =
      existing ||
      (await prisma.class.create({
        data: {
          courseId: courses[classSeed.courseIdx].id,
          teacherId: teachers[classSeed.teacherIdx].id,
          room: classSeed.room,
          weekDays,
          startTime: classSeed.startTime,
          endTime: classSeed.endTime,
          period: classSeed.period,
          maxStudents: classSeed.maxStudents,
          status: "ACTIVE",
        },
      }));
    classes.push(cls);
  }

  const studentSeeds = [
    { name: "Ana Beatriz Silva", artisticName: "Ana Bia", cpf: "11122233344", birthDate: new Date("2005-03-15"), phone: "(11) 91234-5678", whatsapp: "(11) 91234-5678", email: "ana@email.com", city: "Sao Paulo", state: "SP", financialResponsible: "Claudia Silva" },
    { name: "Carlos Eduardo Lima", artisticName: "Carlinhos", cpf: "22233344455", birthDate: new Date("2008-07-22"), phone: "(11) 92345-6789", whatsapp: "(11) 92345-6789", email: "carlos@email.com", city: "Sao Paulo", state: "SP", financialResponsible: "Renata Lima" },
    { name: "Mariana Oliveira", artisticName: "Mari", cpf: "33344455566", birthDate: new Date("2006-11-30"), phone: "(21) 93456-7890", whatsapp: "(21) 93456-7890", email: "mariana@email.com", city: "Rio de Janeiro", state: "RJ", financialResponsible: "Paulo Oliveira" },
    { name: "Pedro Henrique Santos", artisticName: "Pedro", cpf: "44455566677", birthDate: new Date("2007-05-10"), phone: "(31) 94567-8901", whatsapp: "(31) 94567-8901", email: "pedro@email.com", city: "Belo Horizonte", state: "MG", financialResponsible: "Luciana Santos" },
    { name: "Julia Rodrigues", artisticName: "Julinha", cpf: "55566677788", birthDate: new Date("2009-01-20"), phone: "(11) 95678-9012", whatsapp: "(11) 95678-9012", email: "julia@email.com", city: "Sao Paulo", state: "SP", financialResponsible: "Marcelo Rodrigues" },
    { name: "Rafaela Martins", artisticName: "Rafa", cpf: "66677788899", birthDate: new Date("2004-09-05"), phone: "(11) 96789-0123", whatsapp: "(11) 96789-0123", email: "rafaela@email.com", city: "Santo Andre", state: "SP", financialResponsible: "Elaine Martins" },
    { name: "Thiago Almeida", artisticName: "Thi", cpf: "77788899900", birthDate: new Date("2010-02-18"), phone: "(11) 97890-1234", whatsapp: "(11) 97890-1234", email: "thiago@email.com", city: "Osasco", state: "SP", financialResponsible: "Bruno Almeida" },
    { name: "Camila Fernandes", artisticName: "Mila", cpf: "88899900011", birthDate: new Date("2007-08-12"), phone: "(21) 98901-2345", whatsapp: "(21) 98901-2345", email: "camila@email.com", city: "Niteroi", state: "RJ", financialResponsible: "Solange Fernandes" },
  ];

  const students = [];
  for (const studentSeed of studentSeeds) {
    const student = await prisma.student.upsert({
      where: { cpf: studentSeed.cpf },
      update: { status: "ACTIVE" },
      create: { ...studentSeed, status: "ACTIVE" },
    });
    students.push(student);
  }

  const now = new Date();
  const enrollmentSeeds = [
    { studentIdx: 0, classIdx: 0, monthlyFee: 250 },
    { studentIdx: 1, classIdx: 1, monthlyFee: 300 },
    { studentIdx: 2, classIdx: 2, monthlyFee: 350 },
    { studentIdx: 3, classIdx: 3, monthlyFee: 400 },
    { studentIdx: 4, classIdx: 4, monthlyFee: 200 },
    { studentIdx: 5, classIdx: 0, monthlyFee: 250 },
    { studentIdx: 6, classIdx: 1, monthlyFee: 300 },
  ];

  const enrollments = [];
  for (const enrollmentSeed of enrollmentSeeds) {
    const existing = await prisma.enrollment.findFirst({
      where: {
        studentId: students[enrollmentSeed.studentIdx].id,
        classId: classes[enrollmentSeed.classIdx].id,
        status: "ACTIVE",
      },
    });

    const enrollment =
      existing ||
      (await prisma.enrollment.create({
        data: {
          studentId: students[enrollmentSeed.studentIdx].id,
          classId: classes[enrollmentSeed.classIdx].id,
          monthlyFee: enrollmentSeed.monthlyFee,
          contractDate: now,
          startDate: now,
          status: "ACTIVE",
        },
      }));
    enrollments.push(enrollment);
  }

  for (const [index, enrollment] of enrollments.entries()) {
    for (let offset = 0; offset < 3; offset++) {
      const dueDate = new Date(now.getFullYear(), now.getMonth() - offset, 10);
      const status = offset === 0 && index % 3 === 0 ? "PENDING" : offset === 2 && index % 2 === 0 ? "OVERDUE" : "PAID";
      const existing = await prisma.payment.findFirst({
        where: { enrollmentId: enrollment.id, dueDate },
      });

      if (!existing) {
        await prisma.payment.create({
          data: {
            enrollmentId: enrollment.id,
            dueDate,
            paidDate: status === "PAID" ? new Date(dueDate.getTime() + 2 * 86400000) : null,
            amount: enrollment.monthlyFee,
            status,
            method: status === "PAID" ? "PIX" : null,
            notes: `Mensalidade ${dueDate.getMonth() + 1}/${dueDate.getFullYear()}`,
          },
        });
      }
    }
  }

  const expenses = [
    { description: "Aluguel do espaco", amount: 3500, category: "Infraestrutura", dueDate: new Date(now.getFullYear(), now.getMonth(), 5), status: "PAID", paymentMethod: "PIX" },
    { description: "Figurinos para apresentacao", amount: 820, category: "Producao", dueDate: new Date(now.getFullYear(), now.getMonth(), 15), status: "PENDING", paymentMethod: null },
    { description: "Material cenico", amount: 460, category: "Aulas", dueDate: new Date(now.getFullYear(), now.getMonth(), 20), status: "PENDING", paymentMethod: null },
  ];

  for (const expense of expenses) {
    const existing = await prisma.expense.findFirst({ where: { description: expense.description, dueDate: expense.dueDate } });
    if (!existing) {
      await prisma.expense.create({ data: { ...expense, paidDate: expense.status === "PAID" ? expense.dueDate : null } });
    }
  }

  const events = [
    { title: "Aula de Teatro Iniciante", type: "CLASS", classId: classes[0].id, startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14), endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 30), location: "Sala 1", color: "#22c55e" },
    { title: "Ensaio Geral - Peca Othon", type: "REHEARSAL", classId: classes[2].id, startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 18), endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 20), location: "Sala 3", color: "#a855f7" },
    { title: "Apresentacao Turma Infantil", type: "PRESENTATION", classId: null, startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12, 19), endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12, 21), location: "Auditorio", color: "#f59e0b" },
    { title: "Reuniao de Pais e Mestres", type: "MEETING", classId: null, startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 18, 10), endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 18, 11), location: "Sala 2", color: "#3b82f6" },
  ];

  for (const event of events) {
    const existing = await prisma.event.findFirst({ where: { title: event.title, startDate: event.startDate } });
    if (!existing) {
      await prisma.event.create({ data: { ...event, allDay: false } });
    }
  }

  await prisma.settings.upsert({
    where: { id: "default-settings" },
    update: {
      schoolName: "Teatro ERP Escola de Artes",
      schoolPhone: "(11) 3333-4444",
      schoolEmail: "contato@teatroerp.com.br",
    },
    create: {
      id: "default-settings",
      schoolName: "Teatro ERP Escola de Artes",
      schoolAddress: "Rua das Artes, 100 - Sao Paulo/SP",
      schoolPhone: "(11) 3333-4444",
      schoolEmail: "contato@teatroerp.com.br",
      schoolCnpj: "12.345.678/0001-90",
      defaultMonthlyFee: 250,
      lateFeePercent: 2,
      maxStudentsPerClass: 20,
      workingDays: JSON.stringify(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
      academicYear: String(now.getFullYear()),
    },
  });

  const document = await prisma.document.findFirst({ where: { title: "Contrato de Matricula - Ana Beatriz Silva" } });
  if (!document) {
    await prisma.document.create({
      data: {
        title: "Contrato de Matricula - Ana Beatriz Silva",
        type: "CONTRACT",
        category: "Matriculas",
        description: "Contrato ficticio para ambiente de teste",
        studentId: students[0].id,
        enrollmentId: enrollments[0].id,
        tags: JSON.stringify(["seed", "contrato"]),
        uploadedById: admin.id,
      },
    });
  }

  const communication = await prisma.communication.findFirst({ where: { subject: "Boas-vindas ao semestre" } });
  if (!communication) {
    await prisma.communication.create({
      data: {
        type: "EMAIL",
        subject: "Boas-vindas ao semestre",
        content: "Sejam bem-vindos ao novo ciclo de aulas do Teatro ERP.",
        recipients: JSON.stringify(students.map((student) => student.id)),
        recipientType: "ALL_STUDENTS",
        sentById: coord.id,
        sentAt: now,
        status: "SENT",
      },
    });
  }

  const message = await prisma.message.findFirst({ where: { title: "Checklist da apresentacao" } });
  if (!message) {
    await prisma.message.create({
      data: {
        title: "Checklist da apresentacao",
        content: "Confirmar figurino, trilha e ordem de entrada ate sexta-feira.",
        senderId: coord.id,
        recipientId: admin.id,
      },
    });
  }

  const attendanceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const attendance = await prisma.attendance.findFirst({
    where: { studentId: students[0].id, classId: classes[0].id, date: attendanceDate },
  });
  if (!attendance) {
    await prisma.attendance.create({
      data: {
        studentId: students[0].id,
        classId: classes[0].id,
        date: attendanceDate,
        status: "PRESENT",
        content: "Expressao corporal e jogos teatrais",
        recordedBy: coord.name,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE",
      entity: "Seed",
      description: "Dados ficticios carregados no banco MySQL",
      ipAddress: "127.0.0.1",
    },
  });

  console.log("Seed complete.");
  console.log("Admin: admin@teatroerp.com.br / admin123");
  console.log("Coordenacao: coordenacao@teatroerp.com.br / coord123");
  console.log("Financeiro: financeiro@teatroerp.com.br / fin123");
  console.log("Recepcao: recepcao@teatroerp.com.br / rec123");
  console.log("Professor: fernanda@teatroerp.com.br / teacher123");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
