export function numberToWords(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '';

    const wholePart = Math.floor(num);
    const decimalPart = Math.round((num - wholePart) * 100);

    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertLessThanOneThousand = (n: number): string => {
        if (n === 0) return "";
        let result = "";

        if (n >= 100) {
            result += units[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }

        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }

        if (n > 0) {
            result += units[n] + " ";
        }

        return result;
    };

    if (wholePart === 0 && decimalPart === 0) {
        return "Zero Singapore Dollars Only";
    }

    let result = "";

    if (wholePart > 0) {
        let n = wholePart;
        let scale = 0;
        const scales = ["", "Thousand ", "Million ", "Billion ", "Trillion "];
        let parts = [];

        while (n > 0) {
            const chunk = n % 1000;
            if (chunk > 0) {
                parts.unshift(convertLessThanOneThousand(chunk) + scales[scale]);
            }
            n = Math.floor(n / 1000);
            scale++;
        }

        result += parts.join("").replace(/\s+/g, ' ').trim() + " Singapore Dollars";
    }

    if (decimalPart > 0) {
        if (result.length > 0) {
            result += " And ";
        }
        result += convertLessThanOneThousand(decimalPart).replace(/\s+/g, ' ').trim() + " Cents";
    }

    if (result.length > 0) {
        result += " Only";
    }

    return result.charAt(0).toUpperCase() + result.slice(1);
}
