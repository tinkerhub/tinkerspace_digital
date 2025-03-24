export function generateDummyData(count) {
    const dummyData = [];
    const roles = ["Maker", "Mentor"];
    const purposes = [
        "Self Learning",
        "Working on a project",
        "Attending an event",
        "",
    ];
    const workingOnOptions = [
        "React",
        "Flutter",
        "Django",
        "React Native",
        "Redux",
        "Pytorch",
        "",
    ];

    for (let i = 0; i < count; i++) {
        dummyData.push({
            id: i + 1,
            avatar: `https://fastly.picsum.photos/id/616/200/300.jpg?hmac=OPqWGCOp_eJVWmNlthIO-AKugNYYIBYh3Y7mO6MS_eg`,
            checkInTime: new Date().toISOString(),
            checkOutTime: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            membershipId: i + 1,
            mid: i + 1,
            name: `User ${i + 1}`,
            purpose: purposes[Math.floor(Math.random() * purposes.length)],
            role: roles[Math.floor(Math.random() * roles.length)],
            roleId: Math.random() > 0.5 ? 4 : 3,
            workingOn:
                workingOnOptions[
                    Math.floor(Math.random() * workingOnOptions.length)
                ],
            isMentor: Math.random() > 0.5, // Randomly assign as mentor or not
        });
    }

    return dummyData;
}
