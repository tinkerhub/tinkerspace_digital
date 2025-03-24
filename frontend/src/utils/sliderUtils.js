export function divideCardsForSliders(data) {
    const firstCardsNine = data.slice(0, 10);
    const secondCardsNine = data.slice(10, 20);
    const thirdCardsNine = data.slice(20, 30);
    const existingCards = data.slice(30);

    return {
        firstCardsNine,
        secondCardsNine,
        thirdCardsNine,
        existingCards,
    };
}

export function getSliderSettings(
    firstCardsNine,
    secondCardsNine,
    thirdCardsNine,
    existingCards
) {
    // Define isInfinite here
    const isInfinite = existingCards.length > 10;

    const firstCardsNineSettings = {
        infinite: false,
        slidesToShow: Math.min(firstCardsNine.length, 10),
    };

    const secondCardsNineSettings = {
        infinite: false,
        slidesToShow: Math.min(secondCardsNine.length, 10),
    };

    const thirdCardsNineSettings = {
        infinite: false,
        slidesToShow: Math.min(thirdCardsNine.length, 10),
    };

    const existingCardsSettings = {
        infinite: isInfinite,
        slidesToShow: Math.min(existingCards.length, 10),
        autoplay: true,
        autoplaySpeed: 2000,
    };

    return {
        firstCardsNineSettings,
        secondCardsNineSettings,
        thirdCardsNineSettings,
        existingCardsSettings,
    };
}
