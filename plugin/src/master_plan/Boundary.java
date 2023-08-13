package master_plan;

import com.vividsolutions.jump.feature.*;
import com.vividsolutions.jump.workbench.plugin.AbstractPlugIn;
import com.vividsolutions.jump.workbench.plugin.PlugInContext;
import com.vividsolutions.jump.workbench.ui.plugin.FeatureInstaller;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;

import java.sql.SQLException;

public class Boundary extends AbstractPlugIn {

    public Boundary() throws SQLException {
    }

    @Override
    public void initialize(PlugInContext context) throws Exception {
        FeatureInstaller featureInstaller = FeatureInstaller.getInstance(context.getWorkbenchContext()); // OpenJUMP >= 2.0
        featureInstaller.addMainMenuPlugin(
                this, //exe
                new String[]{"Master Plan", "Show Data"},
                this.getName(),
                false,
                null,
                null);
    }

    @Override
    public boolean execute(PlugInContext context) throws Exception {

        Database db = new Database();

        FeatureCollection prg = db.loadMap("prg");

        FeatureCollection pnci = db.getParticelleNotCompletelyIncluded();
        context.getLayerManager().addLayer("Boundary", "Particelle Not Completely Included", pnci);

        FeatureCollection pe = db.getParticelleExcluded();
        context.getLayerManager().addLayer("Boundary", "Particelle Excluded", pe);

        FeatureSchema fs = new FeatureSchema();
        fs.addAttribute("geom", AttributeType.GEOMETRY);

        FeatureCollection fc = new FeatureDataset(fs);

        for (Feature pr : prg.getFeatures()) {
            Geometry pr_g = pr.getGeometry().buffer(100);
            for (Feature pn : pnci.getFeatures()) {
                Geometry pn_g = pn.getGeometry();
                if (pr.getGeometry().intersection(pn_g).getArea() != 0 && !pr_g.contains(pn_g)) {
                    Geometry diff = pn_g.difference(pr_g);
                    Feature f = new BasicFeature(fs);
                    f.setAttribute(0, diff);
                    fc.add(f);
                }
            }
        }

        context.getLayerManager().addLayer("Boundary", "Gap More Than 1 Meter", fc);


        db.close();
        return false;
    }

    @Override
    public String getName() {
        return "Boundary Check";
    }
}