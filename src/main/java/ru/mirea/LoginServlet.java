package ru.mirea;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class LoginServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Map<String, Object> data = new HashMap<>();
        data.put("login", "");
        TemplateUtil.output("login.html", data, resp);
    }

    private static String checkLogin(String login, String password) {
        byte[] hash = LoginUtil.getPasswordHash(login, password);
        try (Connection connection = DatabaseTodoModel.open()) {
            try (PreparedStatement select = connection.prepareStatement("select login from users where login = ? and pass_hash = ?")) {
                select.setString(1, login);
                select.setBytes(2, hash);
                try (ResultSet rs = select.executeQuery()) {
                    if (rs.next()) {
                        return null;
                    } else {
                        return "Неправильный логин или пароль";
                    }
                }
            }
        } catch (SQLException ex) {
            throw new RuntimeException(ex);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String login = req.getParameter("login");
        String password = req.getParameter("password");
        String error = checkLogin(login, password);
        if (error == null) {
            req.getSession().setAttribute(LoginUtil.LOGIN_ATTR, login);
            resp.sendRedirect("todo.html");
        } else {
            Map<String, Object> data = new HashMap<>();
            data.put("login", login);
            data.put("error", error);
            TemplateUtil.output("login.html", data, resp);
        }
    }
}
