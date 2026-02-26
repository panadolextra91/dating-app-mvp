import { PrismaClient, Gender } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- CLEANING DATABASE ---');
    await prisma.availability.deleteMany();
    await prisma.match.deleteMany();
    await prisma.like.deleteMany();
    await prisma.user.deleteMany();

    const teoId = '8229bd0e-2dfc-4c37-be74-bcac8cec9817';

    // Helper để tạo ngày ở tương lai (tránh bị dính vào quá khứ)
    const getFutureDate = (daysOut: number, hours: number) => {
        const d = new Date();
        d.setDate(d.getDate() + daysOut); // Nhảy tới n ngày sau
        d.setHours(hours, 0, 0, 0);       // Set giờ cố định
        return d;
    };

    // PERSONAS centered around VAN TEO with Future Scenarios
    const personas = [
        {
            id: teoId,
            email: 'teo@ex.com',
            name: 'Văn Tèo',
            gender: Gender.MALE,
            bio: 'Tui là Văn Tèo nè mẹ ơi! 🍌 (Acc Chính - Nhập email này để test)',
            age: 20,
        },
        {
            id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', // Bob
            email: 'bob@test.com',
            name: 'Thằng ảo A (Overlap)',
            gender: Gender.MALE,
            bio: 'Scenario A: Rảnh vào sáng mai 9h-11h 🐶',
            age: 21,
            slots: [
                { daysOut: 1, startH: 9, endH: 11 } // Ngày mai, 9h-11h
            ]
        },
        {
            id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', // Cuong
            email: 'cuong@test.com',
            name: 'Thằng ảo B (Lệch Pha)',
            gender: Gender.MALE,
            bio: 'Scenario B: Rảnh chiều kia 14h-15h 💨',
            age: 22,
            slots: [
                { daysOut: 2, startH: 14, endH: 15 } // 2 ngày sau
            ]
        },
        {
            id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', // Dung
            email: 'dung@test.com',
            name: 'Thằng ảo C (Đa Tình)',
            gender: Gender.MALE,
            bio: 'Scenario C: Rảnh nhiều lúc trong tuần tới 💘',
            age: 23,
            slots: [
                { daysOut: 3, startH: 8, endH: 9 },   // 3 ngày sau
                { daysOut: 10, startH: 15, endH: 16 } // 10 ngày sau (Vẫn trong 3 tuần)
            ]
        }
    ];

    console.log('--- SEEDING FUTURE-RELATIVE FLOW (VAN TEO EDITION) ---');

    // 1. Create Users
    for (const p of personas) {
        const user = await prisma.user.create({
            data: {
                id: p.id,
                email: p.email,
                name: p.name,
                age: p.age,
                gender: p.gender,
                bio: p.bio,
            }
        });

        // 2. Add availabilities using future relative dates
        if ('slots' in p) {
            for (const slot of (p as any).slots) {
                await prisma.availability.create({
                    data: {
                        userId: user.id,
                        startTime: getFutureDate(slot.daysOut, slot.startH),
                        endTime: getFutureDate(slot.daysOut, slot.endH)
                    }
                });
            }
        }

        // 3. Create inbound LIKES targeting Văn Tèo
        if (user.id !== teoId) {
            await prisma.like.create({
                data: {
                    fromUserId: user.id,
                    toUserId: teoId
                }
            });
            console.log(`   ✅ Persona ${p.name} ALREADY liked Văn Tèo (Ready for Match flow)`);
        } else {
            console.log(`   ✅ Văn Tèo is ready!`);
        }
    }

    console.log('--- SEEDING SWIPE STACK (10 EXTRA USERS) ---');
    const externalNames = ['Linh Chi', 'Minh Quân', 'Hà Phương', 'Tuấn Hải', 'Lan Khuê', 'Gia Huy', 'Thúy Vi', 'Đức Mạnh', 'Kiều Trang', 'Sơn Tùng'];
    for (let i = 0; i < 10; i++) {
        await prisma.user.create({
            data: {
                email: `swipe_user_${i}@example.com`,
                name: externalNames[i],
                age: 19 + i,
                gender: i % 2 === 0 ? Gender.FEMALE : Gender.MALE,
                bio: `Tui là người qua đường số ${i + 1}. Quẹt tui đi! 🤡`,
            }
        });
    }

    console.log('--- SEEDING COMPLETED ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
