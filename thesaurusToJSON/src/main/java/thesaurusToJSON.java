import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.PrintWriter;
import java.lang.reflect.Field;

/**
 * Created by mfan on 3/11/17.
 */

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;


public class thesaurusToJSON {

    public static final String FILE_READ_PATH = "raw_thesaurus.txt";
    public static final String FILE_WRITE_PATH = "/Users/mfan/Desktop/jsonThesaurus.txt";

    public static void main(String[] args) {
        readThesaurus();

    }

    public static void readThesaurus(){
        String keyString = null;
        try {

            // open input stream test.txt for reading purpose.
            BufferedReader br = new BufferedReader(new FileReader(new File(FILE_READ_PATH)));
            PrintWriter writer = new PrintWriter(FILE_WRITE_PATH, "UTF-8");
            br.readLine();
            while ((keyString = br.readLine()) != null) {
                String[] parts = keyString.split("\\|");
                String key = parts[0];
                int numEntries = Integer.parseInt(parts[1]); //extracts 7 from "help|7"
                String[] entries = new String[numEntries];
                for(int i = 0; i < numEntries; i++){
                    entries[i] = br.readLine();
                }
                JSONObject parsed = parseToJSON(key, entries);
                System.out.println(parsed);
                writer.println(parsed);
            }
            writer.close();

        } catch(Exception e) {
            e.printStackTrace();
        }
    }

    public static JSONObject parseToJSON(String w, String[] s) {

        JSONObject wordSet = new JSONObject();

        JSONArray synonyms = new JSONArray();

        for (String sList : s) {
            String[] list = sList.split("\\|");
            for (int i = 0; i < list.length; i++) {
                synonyms.add(list[i]);
            }
        }

        wordSet.put("word", w);
        wordSet.put("synonyms", synonyms);

        return wordSet;
    }
}
