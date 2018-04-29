package ru.mirea;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class TodoServlet extends HttpServlet {

    private DatabaseTodoModel model = new DatabaseTodoModel();

    private static String getUser(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession();
        String login = (String) session.getAttribute(LoginUtil.LOGIN_ATTR);
        if (login != null)
            return login;
        resp.sendRedirect("login.html");
        return null;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String userId = getUser(req, resp);
        if (userId == null)
            return;
        Map<String, Object> data = new HashMap<>();
        data.put("items", model.getItems(userId));
        TemplateUtil.output("todo.html", data, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String userId = getUser(req, resp);
        if (userId == null)
            return;
        String taskId = req.getParameter("taskId");
        String taskText = req.getParameter("taskText");
        if (taskId != null) {
            int id = Integer.parseInt(taskId);
            model.delete(userId, id);
        } else if (taskText != null) {
            model.add(userId, taskText);
        }
        resp.sendRedirect("todo.html");
    }
}
