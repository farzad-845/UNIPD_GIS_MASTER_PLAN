package master_plan;

import com.vividsolutions.jump.feature.*;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.io.WKTReader;

import java.sql.*;
import java.util.LinkedList;
import java.util.List;

public class Database {
    private static final String connection = "jdbc:postgresql://localhost:5432/master_plan";

    private Connection conn;

    public Database() {
        try {
            conn = DriverManager.getConnection(connection, "postgres", "password");
            System.out.println("Connected to the PostgreSQL server successfully.");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public FeatureCollection loadMap(String tableName) {
        FeatureSchema fs = new FeatureSchema();
        fs.addAttribute("id", AttributeType.STRING);
        fs.addAttribute("geom", AttributeType.GEOMETRY);

        FeatureCollection fc = new FeatureDataset(fs);
        GeometryFactory gf = new GeometryFactory();
        WKTReader wkt = new WKTReader(gf);

//        String query = "SELECT  ST_ASTEXT(ST_TRANSFORM(geom, 3003)) as geometry, * FROM " + tableName;
        String query = "SELECT  ST_ASTEXT(geom) as geometry, * FROM " + tableName;

        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(query);
            while (rs.next()) {
                System.out.println(rs.getString("id"));
                System.out.println(rs.getString("geometry"));

                Feature f = new BasicFeature(fs);

                f.setAttribute("id", rs.getString("id"));
                f.setGeometry(wkt.read(rs.getString("geometry")));

                fc.add(f);
            }
        } catch (SQLException e) {
            System.out.println(e);
        } catch (org.locationtech.jts.io.ParseException e) {
            throw new RuntimeException(e);
        }


        return fc;

    }

    public FeatureCollection getEffectedParticelleByVariant(String varaientId) {
        FeatureSchema fs = new FeatureSchema();
        fs.addAttribute("geom", AttributeType.GEOMETRY);

        FeatureCollection fc = new FeatureDataset(fs);
        GeometryFactory gf = new GeometryFactory();
        WKTReader wkt = new WKTReader(gf);

        String query = "SELECT ST_ASTEXT(pa.geom) as geometry FROM particelle pa JOIN prg pr ON ST_Intersects(pr.geom, pa.geom) WHERE pr.id = '" + varaientId + "'";

        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(query);
            while (rs.next()) {
                Feature f = new BasicFeature(fs);
                f.setGeometry(wkt.read(rs.getString("geometry")));
                fc.add(f);
            }
        } catch (SQLException e) {
            System.out.println(e);
        } catch (org.locationtech.jts.io.ParseException e) {
            throw new RuntimeException(e);
        }


        return fc;

    }

    public List<String> getVariantIDs() {
        List<String> variantIDs = new LinkedList<String>();
        String query = "SELECT id FROM prg";

        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(query);
            while (rs.next()) {
                variantIDs.add(rs.getString("id"));
            }
        } catch (SQLException e) {
            System.out.println(e);
        }

        return variantIDs;
    }

    /**
     * We perform a LEFT JOIN between the particelle table and the variant table using the ST_Intersects function to check if the boundaries intersect.
     * In the WHERE clause, we filter out particles that are completely within the variant's boundaries (ST_Within) or completely outside the variant's boundaries (ST_Disjoint).
     *
     * @return FeatureCollection
     */
    public FeatureCollection checkBoundary() {
        String query = """
                    SELECT p.*
                    FROM particellee p
                    LEFT JOIN prg v ON ST_Intersects(v.geom, p.geom)
                    WHERE NOT ST_Within(p.geom, v.geom) AND NOT ST_Disjoint(p.geom, v.geom);
                """;

        FeatureSchema fs = new FeatureSchema();
        fs.addAttribute("geom", AttributeType.GEOMETRY);

        FeatureCollection fc = new FeatureDataset(fs);
        GeometryFactory gf = new GeometryFactory();
        WKTReader wkt = new WKTReader(gf);

        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(query);
            while (rs.next()) {
                Feature f = new BasicFeature(fs);
                f.setGeometry(wkt.read(rs.getString("highlighted_boundary")));
                fc.add(f);
            }
        } catch (SQLException e) {
            System.out.println(e);
        } catch (org.locationtech.jts.io.ParseException e) {
            throw new RuntimeException(e);
        }


        return fc;
    }

    /**
     * We perform an INNER JOIN between the variant and particelle tables using the ST_Intersects function to identify the particles that have gaps with the variant's boundaries.
     * In the WHERE clause, we filter out particles that are completely within the variant's boundaries (ST_Within) or completely outside the variant's boundaries (ST_Disjoint).
     * We calculate the distance between the boundary of the particle (ST_Boundary(p.geometry)) and the variant's geometry using ST_Distance. If the distance is within the threshold of 1 meter, we consider it a gap.
     * We use the ST_Difference function to extract the highlighted portions of the variant's boundaries that correspond to the gaps with particles.
     * The ST_HausdorffDistance function is used to calculate the Hausdorff distance between the boundary of the particle and the variant's geometry.
     *
     * @return FeatureCollection
     */
    public FeatureCollection getGapsMoreThanOne() {
        String query = """
                    SELECT
                        v.id,
                        ST_Distance(ST_Boundary(p.geom), v.geom) as distance,
                        ST_HausdorffDistance(ST_Boundary(p.geom), v.geom),
                        ST_ASTEXT(ST_Difference(v.geom, p.geom)) AS highlighted_boundary
                    FROM prg v
                    JOIN particellee p ON ST_Intersects(v.geom, p.geom)
                    WHERE NOT ST_Within(p.geom, v.geom) AND NOT ST_Disjoint(p.geom, v.geom)
                    AND ST_HausdorffDistance(ST_Boundary(p.geom), v.geom) >= 1;
                """;

        FeatureSchema fs = new FeatureSchema();
        fs.addAttribute("geom", AttributeType.GEOMETRY);

        FeatureCollection fc = new FeatureDataset(fs);
        GeometryFactory gf = new GeometryFactory();
        WKTReader wkt = new WKTReader(gf);

        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(query);
            while (rs.next()) {
                Feature f = new BasicFeature(fs);
                f.setGeometry(wkt.read(rs.getString("highlighted_boundary")));
                fc.add(f);
            }
        } catch (SQLException e) {
            System.out.println(e);
        } catch (org.locationtech.jts.io.ParseException e) {
            throw new RuntimeException(e);
        }


        return fc;
    }

    public void close() {
        try {
            conn.close();
        } catch (SQLException ignored) {
        }
    }
}
