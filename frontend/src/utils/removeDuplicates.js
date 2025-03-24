export function removeDuplicates(data) {
    return (data || []).reduce((acc, current) => {
      const existingItem = acc.find(item => item.membershipId === current.membershipId);
      if (!existingItem) {
        acc.push(current);
      }
      return acc;
    }, []);
  }
  