/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.ds.xml2fo;

import java.io.File;
import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import org.apache.fop.apps.FOPException;
import org.apache.fop.apps.FOUserAgent;
import org.apache.fop.apps.io.InternalResourceResolver;
import org.apache.fop.fonts.EmbedFontInfo;
import org.apache.fop.fonts.EmbeddingMode;
import org.apache.fop.fonts.EncodingMode;
import org.apache.fop.fonts.Font;
import org.apache.fop.fonts.FontCollection;
import org.apache.fop.fonts.FontTriplet;
import org.apache.fop.fonts.FontUris;
import org.apache.fop.render.RendererConfig.RendererConfigParser;
import org.apache.fop.render.pdf.PDFRendererConfigurator;

/**
 *
 * @author bvdve
 */
public class CustomPDFRendererConfigurator extends PDFRendererConfigurator {
    
    public CustomPDFRendererConfigurator(FOUserAgent userAgent, RendererConfigParser rendererConfigParser) {
        super(userAgent, rendererConfigParser);
    }

    @Override
    protected FontCollection getCustomFontCollection(InternalResourceResolver resolver, String mimeType)
            throws FOPException {

        List<EmbedFontInfo> fontList = new ArrayList<EmbedFontInfo>();
        try {
            URI fileUriMetric = URI.create("file:///D:/XML-FO/fop-1.1/tutorial/fonts/georgiaregular.xml".replace("\\", "/"));
            URI fileUriEmbed = URI.create("file:///D:/XML-FO/fop-1.1/tutorial/fonts/georgiaregular.ttf".replace("\\", "/"));
            FontUris fontUris = new FontUris(fileUriEmbed, fileUriMetric);
            List<FontTriplet> triplets = new ArrayList<FontTriplet>();
            triplets.add(new FontTriplet("Georgia", Font.STYLE_NORMAL, Font.WEIGHT_NORMAL));
            EmbedFontInfo fontInfo = new EmbedFontInfo(fontUris, true, false, triplets, null, EncodingMode.AUTO, EmbeddingMode.AUTO, false, false, false);
            fontList.add(fontInfo);
            System.out.println("Font-->"+fontInfo);
            System.out.println("Font-->"+fontInfo.getPostScriptName());
        } catch (Exception e) {
            e.printStackTrace();
        }

        return createCollectionFromFontList(resolver, fontList);
    }

}
