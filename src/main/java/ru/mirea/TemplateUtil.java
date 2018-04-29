package ru.mirea;

import freemarker.cache.FileTemplateLoader;
import freemarker.core.HTMLOutputFormat;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.util.Map;

public class TemplateUtil {

    private static final Configuration configuration = new Configuration(Configuration.VERSION_2_3_28);

    static {
        configuration.setDefaultEncoding("UTF-8");
        try {
            configuration.setTemplateLoader(new FileTemplateLoader(new File(".")));
        } catch (IOException e) {
            e.printStackTrace();
        }
        configuration.setOutputFormat(HTMLOutputFormat.INSTANCE);
    }

    public static void output(String name, Map<String, Object> data, HttpServletResponse resp) throws IOException, ServletException {
        resp.setCharacterEncoding("UTF-8");
        Template template = configuration.getTemplate(name);
        try {
            template.process(data, resp.getWriter());
        } catch (TemplateException ex) {
            throw new ServletException(ex);
        }
    }
}
