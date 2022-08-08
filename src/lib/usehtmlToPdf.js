import html2canvas from 'html2canvas';
import jsPdf from 'jspdf';

/**
 *  @param canvasDom 打印的节点，canvas所在的节点
 */
const usehtmlToPdf = async(canvasDom) => {
    if (!canvasDom) {
        // tslint:disable-next-line:no-console
        console.error('导出节点不存在！')
        return
    }
    // 将html dom节点生成canvas
    const htmlCanvas = await getCanvasByDom(canvasDom)
    // 将canvas对象转为pdf
    const pdf = canvasToPdf(htmlCanvas)
    // 通过浏览器下载pdf
    //   downPdf(pdf, '文件名')
    return pdf;
}

/**
 *  @param canvasDom 打印的节点，canvas所在的节点
 */
async function getCanvasByDom(canvasDom) {
  const canvas = await html2canvas(canvasDom, {
    dpi: 45,
    scale: window.devicePixelRatio || 2,
    useCORS: true,
    allowTaint: true,
    // taintTest: false,
    imageTimeout: 0,
  }).then((canvas_) => {
    return canvas_;
  })
  return canvas;
}

/**
 *  @param htmlCanvas canvas对象
 */
function canvasToPdf(htmlCanvas, doc) {
  const canvasWidth = htmlCanvas.width
  const canvasHeight = htmlCanvas.height
  const imgBase64 = htmlCanvas.toDataURL('image/jpeg', 1.0)
 
  // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
  const imgWidth = 595.28
  // 图片高度需要等比缩放
  const imgHeight = 595.28 / canvasWidth * canvasHeight
 
  let pageHeight = imgHeight // pdf转化后页面总高度
  let position = 0
 
  const pdfInstance = doc || new jsPdf('', 'pt', 'a4');
  pdfInstance.setFontSize(12)
 
  if (imgHeight < 841.89) {
    pdfInstance.addImage(imgBase64, 'JPEG', 0, 0, imgWidth, imgHeight)
  } else {
    while (pageHeight > 0) {
      pdfInstance.addImage(imgBase64, 'JPEG', 0, position, imgWidth, imgHeight)
      pageHeight -= 841.89
      position -= 841.89
      if (pageHeight > 0) {
        pdfInstance.addPage()
      }
    }
  }
 
  return pdfInstance
}
 
function downPdf(pdfInstance, title) {
  // 文件名过长导致下载失败
  if (title.length > 50) {
    title = title.substring(title.length - 50)
  }
 
  pdfInstance.save(title + '.pdf', { returnPromise: true }).then(() => {
    // 搜狗浏览器下载机制问题暂时不关闭
    if (!(navigator.userAgent.toLowerCase().indexOf('se 2.x') > -1)) {
      setTimeout(window.close, 300)
    }
  })
}
 
export default usehtmlToPdf;

export {
  getCanvasByDom,
  canvasToPdf,
  downPdf,
};
