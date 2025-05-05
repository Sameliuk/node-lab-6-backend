document.addEventListener('DOMContentLoaded', () => {
    const lotData = document.getElementById('lotData');
    const lotId = Number(lotData.dataset.lotId);
    let currentPrice = Number(lotData.dataset.currentPrice);
    const endTime = Number(lotData.dataset.endTime);

    const bidInput = document.querySelector('.bid-controls input');
    const bidButton = document.querySelector('.bid-btn');
    const minusButton = document.querySelector('.btn.minus');
    const plusButton = document.querySelector('.btn.plus');
    const bidCount = document.getElementById('bidCount');
    const currentPriceElement = document.querySelector('.current-price');

    // Оновлення мінімальної ціни після ставки
    function updateMinBidValue() {
        bidInput.min = currentPrice + 1;
        bidInput.value = currentPrice + 1;
    }

    // Логіка кнопок + і -
    minusButton.addEventListener('click', () => {
        let value = parseFloat(bidInput.value);
        if (value > currentPrice + 1) {
            bidInput.value = value - 1;
        }
    });

    plusButton.addEventListener('click', () => {
        bidInput.value = parseFloat(bidInput.value) + 1;
    });

    // Відправка ставки
    bidButton.addEventListener('click', async () => {
        const offerPrice = parseFloat(bidInput.value);

        if (isNaN(offerPrice) || offerPrice <= currentPrice) {
            alert('Ставка має бути більшою за поточну ціну!');
            return;
        }

        try {
            const response = await fetch('/offers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ lotId, offerPrice }),
            });

            const data = await response.json();
            if (response.ok) {
                // Оновлюємо UI без перезавантаження
                currentPrice = offerPrice;
                bidCount.textContent = data.totalBids;
                currentPriceElement.textContent = `Поточна ціна: ${offerPrice} грн`;
                updateMinBidValue();
                alert('Ставку зроблено успішно!');
            } else {
                alert(data.error || 'Помилка при створенні ставки');
            }
        } catch (error) {
            console.error('Помилка:', error);
            alert('Сталася помилка під час створення ставки!');
        }
    });
});
// Динамічне підлаштування ширини інпуту під довжину числа
bidInput.addEventListener('input', function () {
    this.style.width = `${this.value.length + 1}ch`;
});
