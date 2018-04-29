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

public class RegisterServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Map<String, Object> data = new HashMap<>();
        data.put("login", "");
        TemplateUtil.output("register.html", data, resp);
    }

    private static String register(String login, String password1, String password2) {
        if (login == null || password1 == null || password2 == null) {
            return "Не задан логин или пароль";
        }
        if (!password1.equals(password2)) {
            return "Пароль и подтверждение не совпадают";
        }
        try (Connection connection = DatabaseTodoModel.open()) {
            try (PreparedStatement select = connection.prepareStatement("select login from users where login = ?")) {
                select.setString(1, login);
                try (ResultSet rs = select.executeQuery()) {
                    if (rs.next()) {
                        return "Такой логин уже есть";
                    }
                }
            }
            byte[] hash = LoginUtil.getPasswordHash(login, password1);
            try (PreparedStatement insert = connection.prepareStatement("insert into users (login, pass_hash) values (?, ?)")) {
                insert.setString(1, login);
                insert.setBytes(2, hash);
                insert.executeUpdate();
            }
            return null;
        } catch (SQLException ex) {
            throw new RuntimeException(ex);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String login = req.getParameter("login");
        String password1 = req.getParameter("password1");
        String password2 = req.getParameter("password2");
        String error = register(login, password1, password2);
        if (error == null) {
            req.getSession().setAttribute(LoginUtil.LOGIN_ATTR, login);
            resp.sendRedirect("todo.html");
        } else {
            Map<String, Object> data = new HashMap<>();
            data.put("login", login);
            data.put("error", error);
            TemplateUtil.output("register.html", data, resp);
        }
    }
}
