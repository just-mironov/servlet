package ru.mirea;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DatabaseTodoModel {

    private static final String URL = "jdbc:h2:~/todo";

    public static Connection open() throws SQLException {
        return DriverManager.getConnection(URL);
    }

    public List<TodoItem> getItems(String userId) {
        try (Connection connection = open()) {
            try (PreparedStatement select = connection.prepareStatement("select id, text from todo where login = ? order by id")) {
                select.setString(1, userId);
                try (ResultSet rs = select.executeQuery()) {
                    List<TodoItem> items = new ArrayList<>();
                    while (rs.next()) {
                        int id = rs.getInt(1);
                        String text = rs.getString(2);
                        items.add(new TodoItem(id, text));
                    }
                    return items;
                }
            }
        } catch (SQLException ex) {
            throw new RuntimeException(ex);
        }
    }

    public void add(String userId, String text) {
        try (Connection connection = open()) {
            try (PreparedStatement insert = connection.prepareStatement("insert into todo (text, login) values (?, ?)")) {
                insert.setString(1, text);
                insert.setString(2, userId);
                insert.executeUpdate();
            }
        } catch (SQLException ex) {
            throw new RuntimeException(ex);
        }
    }

    public void delete(String userId, int id) {
        try (Connection connection = open()) {
            try (PreparedStatement delete = connection.prepareStatement("delete from todo where id = ? and login = ?")) {
                delete.setInt(1, id);
                delete.setString(2, userId);
                delete.executeUpdate();
            }
        } catch (SQLException ex) {
            throw new RuntimeException(ex);
        }
    }

    public static void main(String[] args) throws SQLException {
        try (Connection connection = open()) {
            try (Statement create = connection.createStatement()) {
                create.execute(
                    "create table todo (" +
                    "  id int auto_increment primary key," +
                    "  text varchar(100)," +
                    "  login varchar(50) not null" +
                    ")"
                );
                create.execute(
                    "create table users (" +
                    "  login varchar(50) primary key," +
                    "  pass_hash binary(32) not null" +
                    ")"
                );
            }
        }
    }
}
