import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { encode as base64Encode } from "base-64"; // Adicionando base-64
import { selectedProject } from "../../../database/firebaseConfig";
import { Asset } from 'expo-asset';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import axios from "axios";

// Inicialização do Firebase
const db = getFirestore();

async function downloadImageFromFirebase(url) {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        if (!response || !response.data) {
            throw new Error("Imagem não encontrada ou vazia.");
        }
        return response.data;
    } catch (error) {
        console.error("Erro ao baixar a imagem do Firebase:", error.message);
        throw new Error("Falha ao baixar a imagem.");
    }
}

async function resizeImageWeb(imageUrl, maxWidth = 300, maxHeight = 300) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");

            const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
            const width = img.width * ratio;
            const height = img.height * ratio;

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) return reject("Erro ao redimensionar imagem.");
                const reader = new FileReader();
                reader.onloadend = () => {
                    const arrayBuffer = reader.result;
                    resolve(arrayBuffer);
                };
                reader.readAsArrayBuffer(blob);
            }, "image/jpeg", 0.7); // compressão
        };
        img.onerror = reject;
        img.src = imageUrl;
    });
}

async function resizeImageMobile(imageUrl, maxWidth = 200, maxHeight = 200) {
    try {
        // Baixar imagem do Firebase
        const fileUri = `${FileSystem.cacheDirectory}temp.jpg`;
        const downloadResumable = FileSystem.createDownloadResumable(imageUrl, fileUri);
        const { uri } = await downloadResumable.downloadAsync();

        // Redimensionar
        const manipulated = await manipulateAsync(
            uri,
            [{ resize: { width: maxWidth, height: maxHeight } }],
            { compress: 0.4, format: SaveFormat.JPEG, base64: false }
        );

        // Ler como arrayBuffer
        const imageBuffer = await FileSystem.readAsStringAsync(manipulated.uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Converter para Uint8Array
        const byteArray = Uint8Array.from(atob(imageBuffer), c => c.charCodeAt(0));
        return byteArray.buffer;

    } catch (error) {
        console.error("Erro ao redimensionar/comprimir imagem no mobile:", error);
        throw error;
    }
}

async function addFirebaseImageToPDF(pdfDoc, page, imageUrl, options = {}) {
    try {
        if (!imageUrl) return;

        let imageBytes;

        if (Platform.OS === "web") {
            const resizedImageBuffer = await resizeImageWeb(imageUrl);
            imageBytes = resizedImageBuffer;
        } else {
            imageBytes = await resizeImageMobile(imageUrl);
        }

        console.log("Tamanho da imagem em bytes:", imageBytes.byteLength);
        console.log("Primeiros bytes:", new Uint8Array(imageBytes).slice(0, 10));

        // Incorporar a imagem no PDF
        const image = await pdfDoc.embedJpg(imageBytes);
        page.drawImage(image, options);

    } catch (error) {
        console.error("Erro ao processar imagem:", error);
    }
}

// Função para obter dados do cliente
async function getClientData(clientId) {
    if (!clientId) return null;
    const clientDoc = await selectedProject.collection("clients").doc(clientId).get();
    return clientDoc.exists ? clientDoc.data() : null;
}

async function getEngenieerData(engenieerId) {
    try {
        if (!engenieerId) {
            throw new Error("ID do engenheiro inválido");
        }

        const engenieerDocRef = doc(db, "engenieer", engenieerId); // Referência ao Firestore
        const engenieerDocSnap = await getDoc(engenieerDocRef); // Obtém os dados

        if (engenieerDocSnap.exists()) {
            console.log("Dados do engenheiro: ", engenieerDocSnap.data())
            return engenieerDocSnap.data(); // Retorna os dados do engenheiro
        } else {
            throw new Error("Engenheiro não encontrado");
        }
    } catch (error) {
        console.error("Erro ao buscar engenheiro:", error.message);
        throw error;
    }
}

async function processImage(uri) {
    try {
        const result = await manipulateAsync(
            uri,
            [{ resize: { width: 300, height: 300 } }], // Reduz tamanho
            { compress: 0.7, format: SaveFormat.PNG } // Mantém PNG mas sem transparência
        );
        return result.uri;
    } catch (error) {
        console.error("Erro ao processar a imagem:", error);
        return null;
    }
}


// Função para adicionar o cabeçalho ao PDF
async function addHeader(pdfDoc, page) {
    try {
        // Carregar a imagem usando expo-asset
        const asset = Asset.fromModule(require('../../../assets/CET LOGO - TRANSPARENCIA(1).png'));
        await asset.downloadAsync(); // Garante que a imagem está disponível localmente
        console.log("Log do asset: ", asset)
        // Obter o caminho correto da imagem
        const imageUri = asset.localUri;
        console.log("log o immageUri: ", imageUri);

        // Incorporar a imagem ao PDF
        const processedImageUri = await processImage(asset.localUri);
        const imageBytes = await fetch(processedImageUri).then((res) => res.arrayBuffer());
        const logoImage = await pdfDoc.embedPng(imageBytes);

        page.drawImage(logoImage, {
            x: 60,
            y: 740,
            width: 80,
            height: 80,
        });

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        page.drawText("C&T Serviço Engenharia", {
            x: 242,
            y: 790,
            size: 10,
            font: helveticaBoldFont,
        });
        page.drawText("Avenida Sábia Q:30 L:27, 27, CEP 75904-370", {
            x: 191,
            y: 780,
            size: 10,
            font: helveticaFont,
        });
        page.drawText("(64) 99244-2480, cleonis@engenhariact.com.br", {
            x: 197,
            y: 770,
            size: 10,
            font: helveticaFont,
        });
    } catch (error) {
        console.error("Erro ao carregar o cabeçalho:", error.message);
    }
}

// Função para adicionar o rodapé ao PDF
async function addFooter(pdfDoc, page, data, pageNumber) {
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const footerTextStart = `ART:${data.artProjeto}`;
    const footerTextEnd = `C&T.0.1 | ${data.numeroProjeto || " "} | ${data.inspection.endDate}`;

    const drawMultilineText = (text, x, y, lineHeight) => {
        const lines = text.split("\n");
        lines.forEach((line, index) => {
            page.drawText(line, {
                x: x,
                y: y - index * lineHeight,
                size: 10,
                font: helveticaFont,
                color: rgb(0.5, 0.5, 0.5),
            });
        });
    };

    const textWidthEnd = helveticaFont.widthOfTextAtSize("C&T.0.1 | " + data.inspection.endDate, 10);

    const xStart = 50;
    const xEnd = 598.28 - textWidthEnd - 50;
    const baseY = 50;
    const lineHeight = 12;

    drawMultilineText(footerTextStart, xStart, baseY, lineHeight);
    drawMultilineText(footerTextEnd, xEnd, baseY, lineHeight);
}

const generatePDFUpdate = async (selectedProject) => {
    console.log("Dados recebidos: ", selectedProject)
    console.log("ID do engenheiro: ", selectedProject.engenieer.id);

    const engenieerData = await getEngenieerData(selectedProject.engenieer.id);

    if (!selectedProject) {
        console.error("Nenhum projeto selecionado!");
        return;
    }

    try {
        // Criar um novo documento PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]);
        const { width, height } = page.getSize();
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Adicionar texto ao PDF
        const xMiddle = (598.28 - helveticaFont.widthOfTextAtSize("TERMO DE ABERTURA", 24)) / 2;

        await addHeader(pdfDoc, page, selectedProject, 1)

        page.drawText(`TERMO DE ATUALIZAÇÃO`, {
            x: xMiddle,
            y: 700,
            size: 24,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0),
        });

        async function drawIndentedText(
            page,
            text,
            x,
            y,
            maxWidth,
            font,
            fontSize,
            lineSpacing,
            indentSize
        ) {
            const paragraphs = text.split("\n"); // Dividir o texto em parágrafos
            let currentY = y;

            for (const paragraph of paragraphs) {
                const words = paragraph.split(" ");
                let currentLine = "";
                let isFirstLine = true; // Marca a primeira linha do parágrafo

                for (const word of words) {
                    const testLine = currentLine ? `${currentLine} ${word}` : word;
                    const textWidth = font.widthOfTextAtSize(testLine, fontSize);

                    if (textWidth <= maxWidth) {
                        currentLine = testLine;
                    } else {
                        // Desenhar a linha quando o limite for atingido
                        page.drawText(currentLine, {
                            x: isFirstLine ? x + indentSize : x, // Adiciona o recuo apenas na primeira linha do parágrafo
                            y: currentY,
                            size: fontSize,
                            font,
                        });
                        isFirstLine = false; // As próximas linhas não terão recuo
                        currentY -= fontSize + lineSpacing;
                        currentLine = word;
                    }
                }

                if (currentLine) {
                    page.drawText(currentLine, {
                        x: isFirstLine ? x + indentSize : x,
                        y: currentY,
                        size: fontSize,
                        font,
                    });
                    currentY -= fontSize + lineSpacing;
                }
            }
        }

        await drawIndentedText(
            page,
            `Em Conformidade ao que estabelece a Portaria SEPRT No 915 de 30 de Julho de 2019 do M.T.E. - Norma Regulamentadora No 13 (NR-13), atualização do Livro de Registro do equipamento tipo ${selectedProject.tipoEquipamento} descrito abaixo.`,
            50,
            664,
            470,
            helveticaFont,
            12,
            4,
            20
        );

        const rowHeight = 98;
        const headerRowHeight = 20;
        const dataRowHeight = 90;
        const tableDataRevisionControl = [
            ["FABRICANTE", "ANO DE FABRICAÇÃO", "N° ART"],
            [
                `${selectedProject.fabricante || " "}`,
                `${selectedProject.anoFabricacao || " "}`,
                `${selectedProject.artProjeto || " "}`,
            ],
        ];

        let columnWidthsDrawTableRevisionControl = [200, 180, 115.28];
        async function drawTableRevisionControl(
            page,
            pdfDoc,
            startX,
            startY,
            columnWidthsDrawTableRevisionControl,
            rowHeight,
            data,
            helveticaFont,
            helveticaBoldFont
        ) {
            let currentY = startY;

            // Desenhar cabeçalho com fundo azul
            const header = data[0];
            header.forEach((cell, columnIndex) => {
                const columnWidth = columnWidthsDrawTableRevisionControl[columnIndex]; // Largura da coluna
                const x = startX + columnWidthsDrawTableRevisionControl
                    .slice(0, columnIndex)
                    .reduce((a, b) => a + b, 0);

                page.drawRectangle({
                    x,
                    y: currentY - headerRowHeight,
                    width: columnWidth,
                    height: headerRowHeight,
                    color: rgb(0.102, 0.204, 0.396), // Azul
                    borderColor: rgb(0.102, 0.204, 0.396),
                    borderWidth: 1,
                });

                // Calcular a posição X para centralizar o texto
                const textWidth = helveticaBoldFont.widthOfTextAtSize(cell, 12);
                const textX = x + (columnWidth - textWidth) / 2; // Centraliza dentro da coluna

                page.drawText(cell, {
                    x: textX, // Usa a posição centralizada
                    y: currentY - headerRowHeight / 2 - 5,
                    size: 12,
                    font: helveticaBoldFont,
                    color: rgb(1, 1, 1), // Branco
                });
            });


            // Desenhar os dados da tabela
            currentY -= headerRowHeight; // Ajuste vertical após cabeçalho
            const lineHeight = 12; // Espaçamento entre linhas
            data.slice(1).forEach((row) => {
                row.forEach((cell, columnIndex) => {
                    const columnWidth = columnWidthsDrawTableRevisionControl[columnIndex]; // Largura da coluna
                    const x = startX + columnWidthsDrawTableRevisionControl
                        .slice(0, columnIndex)
                        .reduce((a, b) => a + b, 0);

                    page.drawRectangle({
                        x,
                        y: currentY,
                        width: columnWidth,
                        height: dataRowHeight / -4,
                        borderColor: rgb(0.102, 0.204, 0.396),
                        borderWidth: 1,
                    });

                    // Ajustar e dividir o texto em linhas
                    const lines = cell.split("\n").map((line) => line.trim());
                    let textY = currentY - 10; // Margem interna superior

                    lines.forEach((line) => {
                        // Calcular a largura do texto
                        const textWidth = helveticaFont.widthOfTextAtSize(line, 10);
                        const textX = x + (columnWidth - textWidth) / 2; // Centralizar dentro da célula

                        page.drawText(line, {
                            x: textX, // Usa a posição centralizada
                            y: textY - lineHeight + 10,
                            size: 10,
                            font: helveticaFont,
                            color: rgb(0, 0, 0),
                        });

                        textY -= lineHeight / 2;
                    });
                });
                currentY -= dataRowHeight; // Pular para a próxima linha da tabela
            });

        }

        await drawTableRevisionControl(
            page,
            pdfDoc,
            50,
            620,
            columnWidthsDrawTableRevisionControl,
            rowHeight,
            tableDataRevisionControl,
            helveticaFont,
            helveticaBoldFont
        );

        const tableDataAnotherExample = [
            ["N° SÉRIE", "N° PATRIMÔNIO", "N° RELATÓRIO", "IDENTIFICADOR EQUIPAMENTO"],
            [
                `${selectedProject.numeroSerie || " "}`,
                `${selectedProject.numeroPatrimonio || " "}`,
                `${selectedProject.numeroProjeto || " "}`,
                `${selectedProject.nomeEquipamento || " "}`,
            ],
        ];

        let columnWidthsAnotherExample = [100, 100, 100, 195.28];

        await drawTableRevisionControl(
            page,
            pdfDoc,
            50, // Posição X
            577, // Posição Y (ajuste para evitar sobreposição)
            columnWidthsAnotherExample,
            rowHeight,
            tableDataAnotherExample,
            helveticaFont,
            helveticaBoldFont
        );

        console.log(selectedProject.inspection.selectedPeriodicInspection)

        let typeInspectionsPeriodic = [];

        if (selectedProject.inspection.selectedPeriodicInspection.externa) {
            typeInspectionsPeriodic.push("externo");
        }
        if (selectedProject.inspection.selectedPeriodicInspection.hidrostatico) {
            typeInspectionsPeriodic.push("hidrostático");
        }
        if (selectedProject.inspection.selectedPeriodicInspection.interna) {
            typeInspectionsPeriodic.push("interno");
        }

        const typeInspectionsPeriodicText = typeInspectionsPeriodic.length > 0 ? typeInspectionsPeriodic.join(" e ") : "nenhuma inspeção";

        let resultInspectionText = "";

        if (selectedProject.inspection.selectedResultInspection.approved) {
            resultInspectionText = "Aprovado, estando desta forma em plenas condições técnicas de ser operado, desde que mantidos os componentes e acessórios apresentados nesta inspeção.";
        } else if (selectedProject.inspection.selectedResultInspection.failed) {
            resultInspectionText = "Reprovado, não estando em plenas condições técnicas de operação. Recomenda-se a correção das não conformidades identificadas antes de qualquer utilização.";
        } else {
            resultInspectionText = "O resultado da inspeção não foi determinado.";
        }

        await drawIndentedText(
            page,
            `Na Data ${selectedProject.inspection.endDate}, foi realizada a inspeção periodica consistindo de exame ${typeInspectionsPeriodicText}.\n\nApós análise e testes executados, o equipamento está ${resultInspectionText}`,
            50,
            520,
            470,
            helveticaFont,
            12,
            4,
            20
        );

        const tableDataEquipmentClassificationTitle = [
            ["CLASSIFICAÇÃO DO EQUIPAMENTO"],
        ];
        let columnWidthsEquipmentClassificationTitle = [495.28];

        await drawTableRevisionControl(
            page,
            pdfDoc,
            50, // Posição X
            450, // Posição Y (ajuste para evitar sobreposição)
            columnWidthsEquipmentClassificationTitle,
            rowHeight,
            tableDataEquipmentClassificationTitle,
            helveticaFont,
            helveticaBoldFont
        );

        const tableDataEquipmentClassification = [
            ["TEMPERATURA DE PROJETO", "VOLUME", "CATEGORIA"],
            [
                `${selectedProject.temperaturaProjeto || ""}`,
                `${selectedProject.volume + selectedProject.tipoVolume || ""}`,
                `${selectedProject.categoriaCaldeira || ""}`
            ]
        ];
        let columnWidthsEquipmentClassification = [195.28, 150, 150];

        await drawTableRevisionControl(
            page,
            pdfDoc,
            50, // Posição X
            430, // Posição Y (ajuste para evitar sobreposição)
            columnWidthsEquipmentClassification,
            rowHeight,
            tableDataEquipmentClassification,
            helveticaFont,
            helveticaBoldFont
        );

        const tableDataEquipmentValuePression = [
            ["PMTA", "PRESSAO DE TESTE HIDROSTÁTICO"],
            [
                `${selectedProject.pressaoMaxima + " " + selectedProject.unidadePressaoMaxima || ""}`,
                `${selectedProject.pressaoTeste + " " + selectedProject.unidadePressaoMaxima || ""}`,
            ]
        ];
        let columnWidthsEquipmentValuePression = [247.64, 247.64];

        await drawTableRevisionControl(
            page,
            pdfDoc,
            50, // Posição X
            390, // Posição Y (ajuste para evitar sobreposição)
            columnWidthsEquipmentValuePression,
            rowHeight,
            tableDataEquipmentValuePression,
            helveticaFont,
            helveticaBoldFont
        );

        const tableDataEquipmentNextInspectionsTitle = [
            ["CRONOGRAMA PRÓXIMAS INSPEÇÕES"],
        ];
        let columnWidthsEquipmentNextInspectionsTitle = [495.28];

        await drawTableRevisionControl(
            page,
            pdfDoc,
            50, // Posição X
            348, // Posição Y (ajuste para evitar sobreposição)
            columnWidthsEquipmentNextInspectionsTitle,
            rowHeight,
            tableDataEquipmentNextInspectionsTitle,
            helveticaFont,
            helveticaBoldFont
        );

        const tableDataEquipmentInfosFinals = [
            ["LOCAL DE INSTALAÇÃO", "DATA DE INSPEÇÃO"],
            [
                `${selectedProject.localInstalacao}`,
                `${selectedProject.inspection.endDate}`
            ]
        ];
        let columnWidthsEquipmentInfosFinals = [247.64, 247.64];

        await drawTableRevisionControl(
            page,
            pdfDoc,
            50, // Posição X
            327.5, // Posição Y (ajuste para evitar sobreposição)
            columnWidthsEquipmentInfosFinals,
            rowHeight,
            tableDataEquipmentInfosFinals,
            helveticaFont,
            helveticaBoldFont
        );

        const imageWidth = 150;
        const imageHeight = 80;
        const imageX = (598.28 - imageWidth) / 2;

        await addFirebaseImageToPDF(pdfDoc, page, engenieerData.signature, {
            x: imageX, // Centralizado
            y: 150, // Posição Y fixa
            width: imageWidth,
            height: imageHeight,
        });
        const lineStartX = 598.28 * 0.25;
        const lineEndX = 598.28 * 0.75;

        page.drawLine({
            start: { x: lineStartX, y: 149 },
            end: { x: lineEndX, y: 148 },
            thickness: 1,
            color: rgb(0, 0, 0),
            opacity: 1,
        });

        const text1 = "Resp. Téc Cleonis Batista Santos";
        const text1Width = helveticaFont.widthOfTextAtSize(text1, 12); // Largura do texto
        const text1X = (598.28 - text1Width) / 2; // Centralizado
        page.drawText(text1, {
            x: text1X,
            y: 136,
            size: 12,
            color: rgb(0, 0, 0),
            font: helveticaFont,
        });
        const text2 = `CREA ${engenieerData.crea}`;
        const text2Width = helveticaFont.widthOfTextAtSize(text2, 12); // Largura do texto
        const text2X = (598.28 - text2Width) / 2; // Centralizado
        page.drawText(text2, {
            x: text2X,
            y: 122,
            size: 12,
            color: rgb(0, 0, 0),
            font: helveticaFont,
        });

        const text3 = "Engenheiro Mecânico/Segurança";
        const text3Width = helveticaFont.widthOfTextAtSize(text3, 12); // Largura do texto
        const text3X = (598.28 - text3Width) / 2; // Centralizado
        page.drawText(text3, {
            x: text3X,
            y: 110,
            size: 12,
            color: rgb(0, 0, 0),
            font: helveticaFont,
        });


        await addFooter(pdfDoc, page, selectedProject, 1);

        // Salvar PDF na memória
        const pdfBytes = await pdfDoc.save();
        const pdfBase64 = base64Encode(String.fromCharCode(...pdfBytes)); // Convertendo para Base64

        if (Platform.OS === "web") {
            // Se for Web, baixar diretamente no navegador
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "relatorio.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // Se for Mobile, salvar e compartilhar
            const fileUri = FileSystem.documentDirectory + "relatorio.pdf";
            await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Compartilhar o arquivo no celular
            await Sharing.shareAsync(fileUri);
        }
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
    }
};

export default generatePDFUpdate;