import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { hash } from "bcryptjs";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@teatroerp.com.br" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@teatroerp.com.br",
      passwordHash: adminPassword,
      role: "ADMIN",
      phone: "(11) 99999-9999",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create coordination user
  const coordPassword = await hash("coord123", 12);
  const coord = await prisma.user.upsert({
    where: { email: "coordenacao@teatroerp.com.br" },
    update: {},
    create: {
      name: "Maria Coordenadora",
      email: "coordenacao@teatroerp.com.br",
      passwordHash: coordPassword,
      role: "COORDINATION",
      phone: "(11) 98888-8888",
    },
  });
  console.log("✅ Coordination user created:", coord.email);

  // Create financial user
  const finPassword = await hash("fin123", 12);
  await prisma.user.upsert({
    where: { email: "financeiro@teatroerp.com.br" },
    update: {},
    create: {
      name: "Carlos Financeiro",
      email: "financeiro@teatroerp.com.br",
      passwordHash: finPassword,
      role: "FINANCIAL",
      phone: "(11) 97777-7777",
    },
  });

  // Create reception user
  const recPassword = await hash("rec123", 12);
  await prisma.user.upsert({
    where: { email: "recepcao@teatroerp.com.br" },
    update: {},
    create: {
      name: "Juliana Recepção",
      email: "recepcao@teatroerp.com.br",
      passwordHash: recPassword,
      role: "RECEPTION",
      phone: "(11) 96666-6666",
    },
  });

  // Create teacher user + teacher profiles
  const teacherUsers = [
    { name: "Fernanda Costa", email: "fernanda@teatroerp.com.br", cpf: "12345678901", specialty: "Teatro Clássico", hourlyRate: 120 },
    { name: "Ricardo Alves", email: "ricardo@teatroerp.com.br", cpf: "23456789012", specialty: "Improvisação", hourlyRate: 150 },
    { name: "Patrícia Souza", email: "patricia@teatroerp.com.br", cpf: "34567890123", specialty: "Teatro Musical", hourlyRate: 180 },
  ];

  const teachers = [];
  for (const t of teacherUsers) {
    const teacherPwd = await hash("teacher123", 12);
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        name: t.name,
        email: t.email,
        passwordHash: teacherPwd,
        role: "TEACHER",
        phone: "(11) 95555-5555",
      },
    });

    const teacher = await prisma.teacher.upsert({
      where: { cpf: t.cpf },
      update: {},
      create: { name: t.name, cpf: t.cpf, phone: "(11) 95555-5555", email: t.email, specialty: t.specialty, hourlyRate: t.hourlyRate, status: "ACTIVE", userId: user.id },
    });
    teachers.push(teacher);
  }
  console.log(`✅ ${teachers.length} teachers created`);

  // Create courses
  const coursesData = [
    { name: "Teatro Iniciante", description: "Curso introdutório de teatro para iniciantes", workload: 120, enrollmentFee: 100, monthlyFee: 250, minAge: 12, maxAge: 17, maxStudents: 20 },
    { name: "Teatro Intermediário", description: "Curso de teatro para alunos com experiência básica", workload: 160, enrollmentFee: 100, monthlyFee: 300, minAge: 15, maxAge: 25, maxStudents: 15 },
    { name: "Teatro Avançado", description: "Curso avançado para alunos experientes", workload: 200, enrollmentFee: 150, monthlyFee: 350, minAge: 18, maxAge: 99, maxStudents: 12 },
    { name: "Teatro Musical", description: "Curso de teatro musical com canto e dança", workload: 180, enrollmentFee: 150, monthlyFee: 400, minAge: 14, maxAge: 30, maxStudents: 20 },
    { name: "Improvisação", description: "Técnicas avançadas de improvisação teatral", workload: 80, enrollmentFee: 80, monthlyFee: 200, minAge: 16, maxAge: 99, maxStudents: 15 },
  ];

  const courses = [];
  for (const c of coursesData) {
    const existing = await prisma.course.findFirst({ where: { name: c.name } });
    if (existing) {
      courses.push(existing);
    } else {
      const course = await prisma.course.create({ data: { ...c, status: "ACTIVE" } });
      courses.push(course);
    }
  }
  console.log(`✅ ${courses.length} courses created`);

  // Create classes
  const classesData = [
    { courseIdx: 0, teacherIdx: 0, room: "Sala 1", weekDays: JSON.stringify(["MONDAY", "WEDNESDAY"]), startTime: "14:00", endTime: "15:30", period: "Tarde", maxStudents: 20 },
    { courseIdx: 1, teacherIdx: 1, room: "Sala 2", weekDays: JSON.stringify(["TUESDAY", "THURSDAY"]), startTime: "16:00", endTime: "17:30", period: "Tarde", maxStudents: 15 },
    { courseIdx: 2, teacherIdx: 2, room: "Sala 3", weekDays: JSON.stringify(["MONDAY", "WEDNESDAY", "FRIDAY"]), startTime: "18:00", endTime: "19:30", period: "Noite", maxStudents: 12 },
    { courseIdx: 3, teacherIdx: 2, room: "Sala 4", weekDays: JSON.stringify(["MONDAY", "WEDNESDAY"]), startTime: "19:30", endTime: "21:00", period: "Noite", maxStudents: 20 },
    { courseIdx: 4, teacherIdx: 1, room: "Sala 1", weekDays: JSON.stringify(["SATURDAY"]), startTime: "09:00", endTime: "12:00", period: "Manhã", maxStudents: 15 },
  ];

  const classes = [];
  for (const c of classesData) {
    const cls = await prisma.class.create({
      data: {
        courseId: courses[c.courseIdx].id,
        teacherId: teachers[c.teacherIdx].id,
        room: c.room,
        weekDays: c.weekDays,
        startTime: c.startTime,
        endTime: c.endTime,
        period: c.period,
        maxStudents: c.maxStudents,
        status: "ACTIVE",
      },
    });
    classes.push(cls);
  }
  console.log(`✅ ${classes.length} classes created`);

  // Create students
  const studentsData = [
    { name: "Ana Beatriz Silva", artisticName: "Ana Bia", cpf: "11122233344", birthDate: new Date("2005-03-15"), phone: "(11) 91234-5678", email: "ana@email.com" },
    { name: "Carlos Eduardo Lima", artisticName: "Carlinhos", cpf: "22233344455", birthDate: new Date("2008-07-22"), phone: "(11) 92345-6789", email: "carlos@email.com" },
    { name: "Mariana Oliveira", artisticName: "Mari", cpf: "33344455566", birthDate: new Date("2006-11-30"), phone: "(21) 93456-7890", email: "mariana@email.com" },
    { name: "Pedro Henrique Santos", artisticName: "Pedrão", cpf: "44455566677", birthDate: new Date("2007-05-10"), phone: "(31) 94567-8901", email: "pedro@email.com" },
    { name: "Julia Rodrigues", artisticName: "Julinha", cpf: "55566677788", birthDate: new Date("2009-01-20"), phone: "(11) 95678-9012", email: "julia@email.com" },
    { name: "Rafaela Martins", artisticName: "Rafa", cpf: "66677788899", birthDate: new Date("2004-09-05"), phone: "(11) 96789-0123", email: "rafaela@email.com" },
    { name: "Thiago Almeida", artisticName: "Thi", cpf: "77788899900", birthDate: new Date("2010-02-18"), phone: "(11) 97890-1234", email: "thiago@email.com" },
    { name: "Camila Fernandes", artisticName: "Mila", cpf: "88899900011", birthDate: new Date("2007-08-12"), phone: "(21) 98901-2345", email: "camila@email.com" },
  ];

  const students = [];
  for (const s of studentsData) {
    const existing = await prisma.student.findUnique({ where: { cpf: s.cpf } });
    if (existing) {
      students.push(existing);
    } else {
      const student = await prisma.student.create({ data: { ...s, status: "ACTIVE" } });
      students.push(student);
    }
  }
  console.log(`✅ ${students.length} students created`);

  const now = new Date();

  // Create enrollments
  const enrollmentPlans = [
    { studentIdx: 0, classIdx: 0, monthlyFee: 250 },
    { studentIdx: 1, classIdx: 1, monthlyFee: 300 },
    { studentIdx: 2, classIdx: 2, monthlyFee: 350 },
    { studentIdx: 3, classIdx: 3, monthlyFee: 400 },
    { studentIdx: 4, classIdx: 4, monthlyFee: 200 },
    { studentIdx: 5, classIdx: 0, monthlyFee: 250 },
    { studentIdx: 6, classIdx: 1, monthlyFee: 300 },
  ];

  const enrollments = [];
  for (const plan of enrollmentPlans) {
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: students[plan.studentIdx].id,
        classId: classes[plan.classIdx].id,
        monthlyFee: plan.monthlyFee,
        contractDate: now,
        startDate: now,
        status: "ACTIVE",
      },
    });
    enrollments.push(enrollment);
  }
  console.log(`✅ ${enrollments.length} enrollments created`);

  // Create payments for each enrollment
  for (const enrollment of enrollments) {
    for (let i = 0; i < 3; i++) {
      const dueDate = new Date(now.getFullYear(), now.getMonth() - i, 10);
      const paid = Math.random() > 0.3;
      const status: string = paid ? "PAID" : (Math.random() > 0.5 ? "PENDING" : "OVERDUE");
      const method: string | null = paid ? "PIX" : null;

      await prisma.payment.create({
        data: {
          enrollmentId: enrollment.id,
          dueDate,
          paidDate: paid ? new Date(dueDate.getTime() + Math.random() * 5 * 86400000) : null,
          amount: enrollment.monthlyFee,
          status,
          method: method,
          notes: `Mensalidade ${dueDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        },
      });
    }
  }
  console.log("✅ Payments created");

  // Create events/schedule
  const eventTemplates = [
    { title: "Aula de Teatro Iniciante", type: "CLASS", color: "#22c55e" },
    { title: "Ensaio Geral - Peça Othon", type: "REHEARSAL", color: "#a855f7" },
    { title: "Apresentação Turma Infantil", type: "PRESENTATION", color: "#f59e0b" },
    { title: "Reunião de Pais e Mestres", type: "MEETING", color: "#3b82f6" },
    { title: "Workshop de Improvisação", type: "CLASS", color: "#22c55e" },
    { title: "Aula de Teatro Musical", type: "CLASS", color: "#22c55e" },
    { title: "Ensaio de Canto", type: "REHEARSAL", color: "#a855f7" },
  ];

  for (let day = 0; day < 60; day++) {
    if (Math.random() > 0.6) {
      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, 14 + Math.floor(Math.random() * 4), 0);
      const endDate = new Date(startDate.getTime() + 1.5 * 3600000);

      await prisma.event.create({
        data: {
          title: template.title,
          type: template.type,
          startDate,
          endDate,
          allDay: false,
          location: `Sala ${Math.floor(Math.random() * 5) + 1}`,
          color: template.color,
        },
      });
    }
  }
  console.log("✅ Events created");

  console.log("\n🎉 Seeding complete!");
  console.log("📧 Admin: admin@teatroerp.com.br / admin123");
  console.log("📧 Coordenação: coordenacao@teatroerp.com.br / coord123");
  console.log("📧 Financeiro: financeiro@teatroerp.com.br / fin123");
  console.log("📧 Recepção: recepcao@teatroerp.com.br / rec123");
  console.log("📧 Professor: fernanda@teatroerp.com.br / teacher123");
  console.log("📧 Professor: ricardo@teatroerp.com.br / teacher123");
  console.log("📧 Professor: patricia@teatroerp.com.br / teacher123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
