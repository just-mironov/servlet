package ru.mirea;

public class TodoItem {

    private int id;
    private String text;

    public TodoItem(int id, String text) {
        this.id = id;
        this.text = text;
    }

    public int getId() {
        return id;
    }

    public String getText() {
        return text;
    }
}
